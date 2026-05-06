import { MonitorContext, ReportType, ErrorType } from "../types";
import { createBasedata } from "../utils";

export class ErrorCollector {
  private ctx: MonitorContext;
  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private resourceErrorHandler: ((event: Event) => void) | null = null;
  private unhandledRejectionHandler:
    | ((event: PromiseRejectionEvent) => void)
    | null = null;
  private originalFetch: typeof window.fetch | null = null;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send | null = null;

  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }

  start(): void {
    // JS 运行时错误
    this.errorHandler = (event: ErrorEvent) => {
      // 资源加载错误会在捕获阶段处理，这里只处理 JS 错误
      if (event.target === window) {
        this.ctx.reporter.add({
          ...createBasedata(this.ctx),
          type: ReportType.ERROR,
          errorType: ErrorType.JS,
          message: event.message || "未知错误",
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    };
    window.addEventListener("error", this.errorHandler);

    // 资源加载失败（捕获阶段）
    this.resourceErrorHandler = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "IMG" ||
          target.tagName === "SCRIPT" ||
          target.tagName === "LINK")
      ) {
        const resourceUrl =
          (target as HTMLImageElement | HTMLScriptElement).src ||
          (target as HTMLLinkElement).href ||
          "";

        this.ctx.reporter.add({
          ...createBasedata(this.ctx),
          type: ReportType.ERROR,
          errorType: ErrorType.RESOURCE,
          message: `${target.tagName.toLowerCase()} 资源加载失败`,
          resourceUrl,
        });
      }
    };
    window.addEventListener("error", this.resourceErrorHandler, true);

    // 未捕获 Promise 拒绝
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let message: string;
      let stack: string | undefined;

      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack;
      } else if (typeof reason === "string") {
        message = reason;
      } else {
        message = JSON.stringify(reason) || "未捕获的 Promise 异常";
      }

      this.ctx.reporter.add({
        ...createBasedata(this.ctx),
        type: ReportType.ERROR,
        errorType: ErrorType.PROMISE,
        message,
        stack,
      });
    };
    window.addEventListener(
      "unhandledrejection",
      this.unhandledRejectionHandler,
    );

    // Fetch 拦截
    this.originalFetch = window.fetch;
    const self = this;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.toString()
            : input;
      const method =
        init?.method || (input instanceof Request ? input.method : "GET");

      if (self.isReportUrl(url)) {
        return self.originalFetch!.call(window, input, init);
      }

      return self.originalFetch!.call(window, input, init).then(
        (response) => {
          if (!response.ok) {
            self.ctx.reporter.add({
              ...createBasedata(self.ctx),
              type: ReportType.ERROR,
              errorType: ErrorType.AJAX,
              message: `请求失败: ${method.toUpperCase()} ${url} 状态码 ${response.status}`,
              resourceUrl: url,
            });
          }
          return response;
        },
        (error) => {
          self.ctx.reporter.add({
            ...createBasedata(self.ctx),
            type: ReportType.ERROR,
            errorType: ErrorType.NETWORK,
            message: `网络请求异常: ${method.toUpperCase()} ${url}`,
            resourceUrl: url,
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error;
        },
      );
    };

    // XMLHttpRequest 拦截
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { _monitorMethod?: string; _monitorUrl?: string },
      method: string,
      url: string | URL,
      ...args: any[]
    ) {
      this._monitorMethod = method;
      this._monitorUrl = url instanceof URL ? url.toString() : url;
      return self.originalXHROpen!.apply(this, [method, url, ...args] as any);
    };

    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { _monitorMethod?: string; _monitorUrl?: string },
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      const xhrMethod = this._monitorMethod || "GET";
      const xhrUrl = this._monitorUrl || "";

      if (!self.isReportUrl(xhrUrl)) {
        this.addEventListener("loadend", function () {
          if (this.status === 0) {
            self.ctx.reporter.add({
              ...createBasedata(self.ctx),
              type: ReportType.ERROR,
              errorType: ErrorType.NETWORK,
              message: `网络请求异常: ${xhrMethod.toUpperCase()} ${xhrUrl}`,
              resourceUrl: xhrUrl,
            });
          } else if (this.status >= 400) {
            self.ctx.reporter.add({
              ...createBasedata(self.ctx),
              type: ReportType.ERROR,
              errorType: ErrorType.AJAX,
              message: `请求失败: ${xhrMethod.toUpperCase()} ${xhrUrl} 状态码 ${this.status}`,
              resourceUrl: xhrUrl,
            });
          }
        });
      }

      return self.originalXHRSend!.call(this, body);
    };
  }

  stop(): void {
    if (this.errorHandler) {
      window.removeEventListener("error", this.errorHandler);
      this.errorHandler = null;
    }
    if (this.resourceErrorHandler) {
      window.removeEventListener("error", this.resourceErrorHandler, true);
      this.resourceErrorHandler = null;
    }
    if (this.unhandledRejectionHandler) {
      window.removeEventListener(
        "unhandledrejection",
        this.unhandledRejectionHandler,
      );
      this.unhandledRejectionHandler = null;
    }
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
      this.originalXHROpen = null;
    }
    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend;
      this.originalXHRSend = null;
    }
  }

  /**
   * 手动上报自定义错误
   */
  reportError(error: Error | string, metadata?: Record<string, any>): void {
    let message: string;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else {
      message = error;
    }

    this.ctx.reporter.add({
      ...createBasedata(this.ctx),
      type: ReportType.ERROR,
      errorType: ErrorType.CUSTOM,
      message,
      stack,
      framework: metadata?.framework,
    });
  }

  private isReportUrl(url: string): boolean {
    const reportUrl = this.ctx.config.reportUrl;
    return reportUrl ? url.includes(reportUrl) : false;
  }
}
