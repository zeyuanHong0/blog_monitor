import type { MonitorConfig, ReportData } from "./types";

export class Reporter {
  private config: MonitorConfig;
  private buffer: ReportData[] = [];
  private timer: number | null = null;
  private onBeforeUnload: (() => void) | null = null;
  private onVisibilityChange: (() => void) | null = null;
  private pendingRequests = 0; // 待发送的请求数量
  private isStopped = false; // 停止接收新数据
  private isDestroying = false; // 销毁中
  private isEventsBound = false;
  private retryTimers: Set<number> = new Set();

  constructor(config: MonitorConfig) {
    this.config = config;
    this.startTimer();
    this.bindPageLeaveEvents();
  }

  add(data: ReportData) {
    if (this.isStopped) return;
    // 采样率过滤
    if (Math.random() > (this.config.sampleRate ?? 1)) return;
    this.buffer.push(data);
    if (this.buffer.length >= (this.config.maxBatchSize ?? 10)) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;
    const data = this.buffer;
    this.buffer = [];
    await this.send(data);
  }

  private startTimer() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval ?? 5000);
  }

  private bindPageLeaveEvents(): void {
    if (this.isEventsBound) return;
    this.isEventsBound = true;

    const onLeave = () => {
      if (this.buffer.length === 0) return;
      const blob = new Blob(
        [JSON.stringify({ appId: this.config.appId, data: this.buffer })],
        { type: "application/json" },
      );
      navigator.sendBeacon(this.config.reportUrl, blob);
      this.buffer = [];
    };

    this.onBeforeUnload = onLeave;
    this.onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onLeave();
      }
    };

    window.addEventListener("beforeunload", this.onBeforeUnload);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private async send(data: ReportData[], retryCount = 0): Promise<void> {
    if (this.isDestroying) return;
    if (retryCount === 0) this.pendingRequests++; // 只有初始发送才增加请求计数，重试不增加
    try {
      await fetch(this.config.reportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId: this.config.appId, data }),
      });
    } catch (err) {
      if (retryCount < (this.config.maxRetries ?? 3) && !this.isDestroying) {
        const delay = Math.pow(2, retryCount) * 1000;
        const timeoutId = window.setTimeout(() => {
          this.retryTimers.delete(timeoutId);
          this.send(data, retryCount + 1);
        }, delay);
        this.retryTimers.add(timeoutId);
        return;
      }
    }
    this.pendingRequests--;
  }

  async destroy(): Promise<void> {
    this.isStopped = true;
    await this.flush();
    this.isDestroying = true;
    // 清理所有重试定时器
    this.retryTimers.forEach((timeoutId) => clearTimeout(timeoutId));
    this.retryTimers.clear();

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.onBeforeUnload) {
      window.removeEventListener("beforeunload", this.onBeforeUnload);
      this.onBeforeUnload = null;
    }
    if (this.onVisibilityChange) {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
      this.onVisibilityChange = null;
    }

    // 等待所有请求完成
    while (this.pendingRequests > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
