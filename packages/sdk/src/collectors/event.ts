import { Reporter } from "../reporter";
import type { MonitorContext } from "../types";

export class EventCollector {
  private ctx: MonitorContext;
  constructor(ctx: MonitorContext) {
    this.ctx = ctx;
  }
  start() {}
  stop() {}
}
