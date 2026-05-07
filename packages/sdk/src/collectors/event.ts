import { ReportType, type MonitorContext } from "../types";
import { createBasedata } from "../utils";

export class EventCollector {
  private ctx: MonitorContext;
  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }
  track(eventName: string, data?: Record<string, any>): void {
    this.ctx.reporter.add({
      type: ReportType.EVENT,
      ...createBasedata(this.ctx),
      eventName,
      eventData: data || {},
    });
  }
}
