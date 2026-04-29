import type { MonitorConfig, ReportData } from "./types";

export class Reporter {
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  add(data: ReportData) {}

  destroy(): void {}
}
