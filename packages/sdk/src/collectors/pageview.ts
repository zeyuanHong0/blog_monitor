import type { MonitorContext } from "../types";
import { ReportType } from "../types";
import { createBasedata, getPageInfo } from "../utils";

export class PageViewCollector {
  private ctx: MonitorContext;
  private referrerUrl: string = document.referrer || ""; // 上一次访问的url
  private lastReportedUrl: string = ""; // 上一次上报的url
  private originalPushState!: typeof history.pushState;
  private originalReplaceState!: typeof history.replaceState;
  private readonly handlePopState = () => this.reportPageView();
  private isStarted: boolean = false;

  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;

    this.reportPageView(); // 上报初始页面访问

    // 重写 history.pushState和history.replaceState来监听SPA路由变化
    this.originalPushState = history.pushState;
    history.pushState = (...args) => {
      this.originalPushState.apply(history, args);
      this.reportPageView();
    };

    this.originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      this.originalReplaceState.apply(history, args);
      this.reportPageView();
    };

    window.addEventListener("popstate", this.handlePopState);
  }

  stop() {
    if (!this.isStarted) return;
    this.isStarted = false;

    // 恢复原始的history方法
    history.pushState = this.originalPushState;
    history.replaceState = this.originalReplaceState;
    window.removeEventListener("popstate", this.handlePopState);
  }

  private reportPageView(): void {
    const { url, title } = getPageInfo();

    if (url === this.lastReportedUrl) return; // 避免重复上报同一个页面

    this.ctx.reporter.add({
      type: ReportType.PAGEVIEW,
      ...createBasedata(this.ctx),
      url,
      referrer: this.referrerUrl,
      title,
    });

    this.referrerUrl = url;
    this.lastReportedUrl = url;
  }
}
