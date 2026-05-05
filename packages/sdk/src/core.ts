import {
  type MonitorConfig,
  type ReportData,
  type MonitorContext,
  ReportType,
} from "./types";
import { Reporter } from "./reporter";
import { PageViewCollector } from "./collectors/pageview";
import { PerformanceCollector } from "./collectors/performance";
import { SoftNavigationCollector } from "./collectors/soft-navigation";
import { ErrorCollector } from "./collectors/error";
import {
  generateSessionId,
  getPageInfo,
  parseUserAgent,
  createBasedata,
} from "./utils";

interface Collector {
  start(): void;
  stop(): void;
}

class BlogMonitorCore {
  private config!: MonitorConfig;
  private reporter!: Reporter;
  private collectors: Collector[] = [];
  private ctx!: MonitorContext;
  private initialized = false;

  // 初始化
  init(config: MonitorConfig): void {
    if (this.initialized) return;

    this.config = {
      enablePerformance: true,
      enableError: true,
      sampleRate: 1.0,
      maxBatchSize: 10,
      flushInterval: 5000,
      maxRetries: 3,
      ...config,
    };

    this.reporter = new Reporter(this.config);

    this.ctx = {
      config: this.config,
      reporter: this.reporter,
      sessionId: generateSessionId(),
    };

    const pvCollector = new PageViewCollector(this.ctx);
    this.collectors.push(pvCollector);

    if (this.config.enablePerformance) {
      const performanceCollector = new PerformanceCollector(this.ctx);
      this.collectors.push(performanceCollector);
    }

    if (this.config.enableSoftNavigation) {
      const softNavCollector = new SoftNavigationCollector(this.ctx);
      this.collectors.push(softNavCollector);
    }

    if (this.config.enableError) {
      const errorCollector = new ErrorCollector(this.ctx);
      this.collectors.push(errorCollector);
    }

    this.collectors.forEach((collector) => collector.start());

    this.initialized = true;
  }

  // 手动上报
  track(eventName: string, data?: Record<string, any>): void {
    if (!this.initialized) return;
    this.reporter.add({
      type: ReportType.EVENT,
      ...createBasedata(this.ctx),
      eventName,
      eventData: data || {},
    });
  }

  destroy(): void {
    if (!this.initialized) return;
    this.collectors.forEach((c) => c.stop());
    this.collectors = [];
    this.reporter.destroy();
    this.initialized = false;
  }
}

export const BlogMonitor = new BlogMonitorCore();
