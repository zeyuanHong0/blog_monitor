import type { MonitorConfig, ReportData } from "./types";

export class Reporter {
  private config: MonitorConfig;
  private buffer: ReportData[] = [];
  private timer: number | null = null;

  constructor(config: MonitorConfig) {
    this.config = config;
    this.startTimer();
  }

  add(data: ReportData) {
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

  private send(data: ReportData[]) {
    fetch(this.config.reportUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appId: this.config.appId, data }),
    });
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}
