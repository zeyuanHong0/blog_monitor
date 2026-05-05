import {
  ReportType,
  type MonitorContext,
  type SoftNavigationData,
} from "../types";
import { createBasedata, isEntryTypeSupported } from "../utils";

type SoftNavMetricType = "lcp" | "cls" | "inp";

export class SoftNavigationCollector {
  private ctx: MonitorContext;
  private observerMap: Partial<Record<SoftNavMetricType, PerformanceObserver>> =
    {};

  // 导航状态
  private hasNavigated = false;
  private hasReportedCurrentRound = false;
  private navigationStartTime = 0;
  private fromUrl = "";

  // lcp 相关
  private lcp: number | null = null;
  private lcpInputListenersAdded = false;
  private readonly handleLcpInput = () => this.disconnectLcp();

  // cls 相关（session window 算法）
  private clsSessionValue = 0;
  private clsSessionStartTime = -1;
  private clsLastEntryTime = -1;
  private clsMaxValue = 0;

  // inp 相关
  private inpInteractionMap = new Map<number, PerformanceEventTiming>();
  private readonly INP_MAX_SIZE = 200;
  private inp: number | null = null;

  // DOM 稳定检测相关
  private mutationObserver: MutationObserver | null = null;
  private navigationDuration: number | null = null;
  private domStableTimer: ReturnType<typeof setTimeout> | null = null;
  private domStableMaxTimer: ReturnType<typeof setTimeout> | null = null;

  // 事件监听器引用（用于清理）
  private readonly handleRouteChange = (e: Event) => {
    console.log("handleRouteChange", e);
    const detail = (e as CustomEvent<{ newUrl: string; oldUrl: string }>)
      .detail;
    this.onRouteChange(detail.newUrl, detail.oldUrl);
  };

  private readonly handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.reportSoftNavigation();
    }
  };

  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }

  start() {
    console.log("SoftNavigationCollector started");
    window.addEventListener(
      "__blog_monitor_route_change__",
      this.handleRouteChange,
    );
    window.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  stop() {
    // 上报最后一轮数据
    this.reportSoftNavigation();

    // 移除事件监听器
    window.removeEventListener(
      "__blog_monitor_route_change__",
      this.handleRouteChange,
    );
    window.removeEventListener("visibilitychange", this.handleVisibilityChange);

    // 断开所有 observer
    this.disconnectAllObservers();
    this.cleanupDomStableObserver();
    this.removeLcpInputListeners();
  }

  private onRouteChange(newUrl: string, oldUrl: string) {
    // 上报上一轮指标（如果有）
    this.reportSoftNavigation();

    // 重置所有状态
    this.resetState();

    // 记录本轮导航信息
    this.hasNavigated = true;
    this.hasReportedCurrentRound = false;
    this.fromUrl = oldUrl;
    this.navigationStartTime = performance.now();

    // 重新初始化 observer
    this.initObservers();
    this.observeDomStable();
  }

  private resetState() {
    // 断开旧 observer
    this.disconnectAllObservers();
    this.removeLcpInputListeners();
    this.cleanupDomStableObserver();

    // 重置 LCP
    this.lcp = null;

    // 重置 DOM 稳定时间
    this.navigationDuration = null;

    // 重置 CLS session 状态
    this.clsSessionValue = 0;
    this.clsSessionStartTime = -1;
    this.clsLastEntryTime = -1;
    this.clsMaxValue = 0;

    // 重置 INP
    this.inpInteractionMap.clear();
    this.inp = null;
  }

  private initObservers() {
    this.observeLcp();
    this.observeCls();
    this.observeInp();
  }

  // 获取 LCP
  // 浏览器的 largest-contentful-paint observer 仅在初始页面加载时发射 entry，
  // SPA 路由切换后不会重新触发
  private observeLcp() {
    if (!isEntryTypeSupported("largest-contentful-paint")) return;
    this.observerMap.lcp = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      // 只记录导航开始后的 LCP entry
      if (lastEntry && lastEntry.startTime >= this.navigationStartTime) {
        this.lcp = lastEntry.startTime - this.navigationStartTime;
      }
    });
    this.observerMap.lcp.observe({ type: "largest-contentful-paint" });

    // 用户首次交互后 LCP 不再变化，主动 disconnect
    this.lcpInputListenersAdded = true;
    (["keydown", "click", "scroll"] as const).forEach((evt) => {
      window.addEventListener(evt, this.handleLcpInput, { once: true });
    });
  }

  private disconnectLcp() {
    this.observerMap.lcp?.disconnect();
    this.removeLcpInputListeners();
  }

  private removeLcpInputListeners() {
    if (!this.lcpInputListenersAdded) return;
    (["keydown", "click", "scroll"] as const).forEach((evt) => {
      window.removeEventListener(evt, this.handleLcpInput);
    });
    this.lcpInputListenersAdded = false;
  }

  // 获取 CLS（session window 算法）
  private observeCls() {
    if (!isEntryTypeSupported("layout-shift")) return;
    this.observerMap.cls = new PerformanceObserver((list) => {
      const entries = list.getEntries() as LayoutShift[];
      entries.forEach((entry) => {
        if (entry.hadRecentInput) return;

        // 如果与上一条目间隔 > 1s 或窗口起始到当前 > 5s，开启新窗口
        if (
          this.clsSessionStartTime === -1 ||
          entry.startTime - this.clsLastEntryTime > 1000 ||
          entry.startTime - this.clsSessionStartTime > 5000
        ) {
          this.clsSessionStartTime = entry.startTime;
          this.clsSessionValue = 0;
        }

        this.clsLastEntryTime = entry.startTime;
        this.clsSessionValue += entry.value;

        // 取所有窗口中的最大值
        if (this.clsSessionValue > this.clsMaxValue) {
          this.clsMaxValue = this.clsSessionValue;
        }
      });
    });
    this.observerMap.cls.observe({ type: "layout-shift" });
  }

  // 获取 INP
  private observeInp() {
    if (!isEntryTypeSupported("event")) return;
    this.observerMap.inp = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      entries.forEach((entry) => {
        if (entry.interactionId === 0) return;
        const oldEntry = this.inpInteractionMap.get(entry.interactionId);
        // 更新最大 duration
        if (!oldEntry || entry.duration > oldEntry.duration) {
          this.inpInteractionMap.set(entry.interactionId, entry);
        }
        // 限制 Map 最大容量
        if (this.inpInteractionMap.size > this.INP_MAX_SIZE) {
          const sorted = Array.from(this.inpInteractionMap.values()).sort(
            (a, b) => b.duration - a.duration,
          );
          this.inpInteractionMap.clear();
          sorted.slice(0, this.INP_MAX_SIZE).forEach((e) => {
            this.inpInteractionMap.set(e.interactionId, e);
          });
        }
      });
    });
    this.observerMap.inp.observe({
      type: "event",
      durationThreshold: 40,
    } as PerformanceObserverInit & { durationThreshold: number });
  }

  // 最终计算 INP 值（取 P98 或最大值）
  private finalizeInp() {
    const list = Array.from(this.inpInteractionMap.values());
    const size = list.length;
    if (!size) return;
    const sorted = list.sort((a, b) => a.duration - b.duration);
    if (size < 50) {
      this.inp = sorted[sorted.length - 1]?.duration || 0;
    } else {
      const index = Math.floor(size * 0.98);
      this.inp = sorted[index]?.duration || 0;
    }
  }

  private reportSoftNavigation() {
    // 首次路由切换前不上报空数据
    if (!this.hasNavigated) return;
    // 已上报的轮次不重复上报
    if (this.hasReportedCurrentRound) return;

    // 上报前确保 INP 已完成最终计算
    this.finalizeInp();

    // 计算 navigationDuration
    // 优先级：LCP > DOM 稳定时间 > 当前时间差（兜底）
    const navigationDuration =
      this.lcp !== null
        ? this.lcp
        : this.navigationDuration !== null
          ? this.navigationDuration
          : performance.now() - this.navigationStartTime;

    this.ctx.reporter.add({
      type: ReportType.SOFT_NAVIGATION,
      ...createBasedata(this.ctx),
      fromUrl: this.fromUrl,
      lcp: this.lcp,
      cls: this.clsMaxValue > 0 ? this.clsMaxValue : null,
      inp: this.inp,
      navigationDuration,
    } as SoftNavigationData);

    this.hasReportedCurrentRound = true;
  }

  private observeDomStable() {
    this.mutationObserver = new MutationObserver(() => {
      if (this.domStableTimer !== null) {
        clearTimeout(this.domStableTimer);
      }
      this.domStableTimer = setTimeout(() => this.onDomStable(), 1000);
    });
    this.mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    // 最大超时：即使 DOM 一直在变也强制认为稳定
    this.domStableMaxTimer = setTimeout(() => this.onDomStable(), 5000);
  }

  private onDomStable() {
    this.navigationDuration = performance.now() - this.navigationStartTime;
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    if (this.domStableTimer !== null) {
      clearTimeout(this.domStableTimer);
      this.domStableTimer = null;
    }
    if (this.domStableMaxTimer !== null) {
      clearTimeout(this.domStableMaxTimer);
      this.domStableMaxTimer = null;
    }
  }

  private cleanupDomStableObserver() {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    if (this.domStableTimer !== null) {
      clearTimeout(this.domStableTimer);
      this.domStableTimer = null;
    }
    if (this.domStableMaxTimer !== null) {
      clearTimeout(this.domStableMaxTimer);
      this.domStableMaxTimer = null;
    }
  }

  private disconnectAllObservers() {
    Object.values(this.observerMap).forEach((observer) => {
      observer.disconnect();
    });
    this.observerMap = {};
  }
}
