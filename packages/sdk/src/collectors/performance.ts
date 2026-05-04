import {
  ReportType,
  type MonitorContext,
  type PerformanceData,
} from "../types";
import { createBasedata, isEntryTypeSupported } from "../utils";

type MetricType = "fcp" | "lcp" | "inp" | "cls";

export class PerformanceCollector {
  private ctx: MonitorContext;
  private metrics: Partial<PerformanceData> = {};
  private observerMap: Partial<Record<MetricType, PerformanceObserver>> = {};
  private hasReported: boolean = false;
  private readonly handleVisibilityChange = () => this.reportPerformance();

  // inp相关状态
  private inpInteractionMap = new Map<number, PerformanceEventTiming>();
  private readonly INP_MAX_SIZE = 200;

  // cls相关状态
  private clsSessionValue = 0; // 当前 session 窗口的值
  private clsSessionStartTime = -1; // 当前 session 窗口的开始时间
  private clsLastEntryTime = -1; // 上一条目时间
  private clsMaxValue = 0; // 所有 session 窗口的最大值

  // lcp相关
  private readonly handleLcpInput = () => this.disconnectLcp();
  private lcpInputListenersAdded = false;

  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }

  // 获取 fcp
  getFcp() {
    if (!isEntryTypeSupported("paint")) return;
    this.observerMap.fcp = new PerformanceObserver((list) => {
      const entriesList = list.getEntries();
      entriesList.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          this.metrics.fcp = entry.startTime;
          this.observerMap.fcp?.disconnect();
        }
      });
    });
    this.observerMap.fcp.observe({ type: "paint", buffered: true });
  }

  // 获取 lcp
  getLcp() {
    if (!isEntryTypeSupported("largest-contentful-paint")) return;
    this.observerMap.lcp = new PerformanceObserver((list) => {
      const entriesList = list.getEntries();
      const lastEntry = entriesList[entriesList.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    });
    this.observerMap.lcp.observe({
      type: "largest-contentful-paint",
      buffered: true,
    });

    // 用户首次交互后 LCP 不再变化，主动 disconnect
    this.lcpInputListenersAdded = true;
    (["keydown", "click", "scroll"] as const).forEach((evt) => {
      window.addEventListener(evt, this.handleLcpInput, { once: true });
    });
  }

  // 用户交互时断开 LCP observer 并清理监听器
  private disconnectLcp() {
    this.observerMap.lcp?.disconnect();
    this.removeLcpInputListeners();
  }

  // 移除 LCP 用户交互监听器
  private removeLcpInputListeners() {
    if (!this.lcpInputListenersAdded) return;
    (["keydown", "click", "scroll"] as const).forEach((evt) => {
      window.removeEventListener(evt, this.handleLcpInput);
    });
    this.lcpInputListenersAdded = false;
  }

  // 获取 inp
  getInp() {
    if (!isEntryTypeSupported("event")) return;
    this.observerMap.inp = new PerformanceObserver((list) => {
      const entriesList = list.getEntries() as PerformanceEventTiming[];
      entriesList.forEach((entry) => {
        if (entry.interactionId === 0) return;
        const oldEntry = this.inpInteractionMap.get(entry.interactionId);
        // 更新最大 duration
        if (!oldEntry || entry.duration > oldEntry.duration) {
          this.inpInteractionMap.set(entry.interactionId, entry);
        }
        if (this.inpInteractionMap.size > this.INP_MAX_SIZE) {
          const sorted = Array.from(this.inpInteractionMap.values()).sort(
            (a, b) => b.duration - a.duration,
          );
          this.inpInteractionMap.clear();
          sorted.slice(0, this.INP_MAX_SIZE).forEach((entry) => {
            this.inpInteractionMap.set(entry.interactionId, entry);
          });
        }
      });
    });
    this.observerMap.inp.observe({
      type: "event",
      buffered: true,
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
      this.metrics.inp = sorted[sorted.length - 1]?.duration || 0;
    } else {
      const index = Math.floor(size * 0.98);
      this.metrics.inp = sorted[index]?.duration || 0;
    }
  }

  // 获取 cls（session window 算法）
  getCls() {
    if (!isEntryTypeSupported("layout-shift")) return;
    this.observerMap.cls = new PerformanceObserver((list) => {
      const entriesList = list.getEntries() as LayoutShift[];
      entriesList.forEach((entry) => {
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
        this.metrics.cls = this.clsMaxValue;
      });
    });
    this.observerMap.cls.observe({ type: "layout-shift", buffered: true });
  }

  // 获取 ttfb
  getTTFB() {
    const [navEntry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (!navEntry) return;
    this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
  }

  start() {
    console.log("PerformanceCollector started");
    this.getTTFB();
    this.getFcp();
    this.getLcp();
    this.getInp();
    this.getCls();
    window.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  reportPerformance() {
    if (this.hasReported) return;
    if (document.visibilityState === "hidden") {
      // 上报前确保 INP 已完成最终计算
      this.finalizeInp();
      this.ctx.reporter.add({
        type: ReportType.PERFORMANCE,
        ...createBasedata(this.ctx),
        ttfb: this.metrics.ttfb ?? null,
        fcp: this.metrics.fcp ?? null,
        lcp: this.metrics.lcp ?? null,
        inp: this.metrics.inp ?? null,
        cls: this.metrics.cls ?? null,
      });
      this.hasReported = true;
    }
  }

  stop() {
    // 移除所有 observer
    Object.values(this.observerMap).forEach((observer) => {
      observer.disconnect();
    });
    window.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.removeLcpInputListeners();
  }
}
