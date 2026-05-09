import type { MonitorConfig, ReportData } from "./types";

export class Reporter {
  private config: MonitorConfig;
  private buffer: ReportData[] = [];
  private timer: number | null = null;
  private onBeforeUnload: (() => void) | null = null;
  private onVisibilityChange: (() => void) | null = null;
  private pendingRequests = 0;
  private isDestroying = false;
  private isEventsBound = false;
  private hasBeaconSent = false;

  constructor(config: MonitorConfig) {
    this.config = config;
    this.startTimer();
    this.bindPageLeaveEvents();
  }

  add(data: ReportData) {
    // 已销毁，不再接收数据
    if (this.isDestroying) return;
    // 采样率过滤
    if (Math.random() > (this.config.sampleRate ?? 1)) return;
    this.buffer.push(data);
    if (this.buffer.length >= (this.config.maxBatchSize ?? 10)) {
      this.flush();
    }
  }

  private flush() {
    if (this.buffer.length === 0) return;
    const data = this.buffer;
    this.buffer = [];
    this.send(data);
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
      // 防止 sendBeacon 被多次调用
      if (this.hasBeaconSent) return;
      if (this.buffer.length === 0) return;
      
      this.hasBeaconSent = true;
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
    this.pendingRequests++;
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
        setTimeout(() => this.send(data, retryCount + 1), delay);
        return;
      }
    } finally {
      this.pendingRequests--;
    }
  }

  async destroy(): Promise<void> {
    this.isDestroying = true;
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
    this.flush();
    // 等待所有待发送的请求完成
    while (this.pendingRequests > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
