import {
  ReportType,
  type MonitorContext,
  type PerformanceData,
} from "../types";
import { createBasedata } from "../utils";

type MetricType = "fcp" | "lcp" | "fid" | "cls";
export class PerformanceCollector {
  private ctx: MonitorContext;
  private metrics: Partial<PerformanceData> = {};
  private observerMap: Partial<Record<MetricType, PerformanceObserver>> = {};
  private hasReported: boolean = false;
  private readonly handleVisibilityChange = () => this.reportPerformance();
  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }

  // 获取 fcp
  getFcp() {
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
    this.observerMap.lcp = new PerformanceObserver((list) => {
      const entriesList = list.getEntries();
      const lastEntry = entriesList[entriesList.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    });
    this.observerMap.lcp.observe({
      type: "largest-contentful-paint",
      buffered: true,
    });
  }
  // 获取 fid
  getFid() {
    this.observerMap.fid = new PerformanceObserver((list) => {
      const entriesList = list.getEntries() as PerformanceEventTiming[];
      entriesList.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.observerMap.fid?.disconnect();
      });
    });
    this.observerMap.fid.observe({ type: "first-input", buffered: true });
  }
  // 获取 cls
  getCls() {
    this.observerMap.cls = new PerformanceObserver((list) => {
      const entriesList = list.getEntries() as LayoutShift[];
      entriesList.forEach((entry) => {
        if (!entry.hadRecentInput) {
          this.metrics.cls = (this.metrics.cls ?? 0) + entry.value;
        }
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
    this.getFid();
    this.getCls();
    window.addEventListener("visibilitychange", this.handleVisibilityChange);
  }
  reportPerformance() {
    if (this.hasReported) return;
    if (document.visibilityState === "hidden") {
      this.ctx.reporter.add({
        type: ReportType.PERFORMANCE,
        ...createBasedata(this.ctx),
        ttfb: this.metrics.ttfb ?? null,
        fcp: this.metrics.fcp ?? null,
        lcp: this.metrics.lcp ?? null,
        fid: this.metrics.fid ?? null,
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
  }
}
