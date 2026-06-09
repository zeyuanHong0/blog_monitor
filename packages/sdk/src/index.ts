import { BlogMonitor as WebMonitor } from "./core";
export const version = "0.1.0";
export { WebMonitor };
export { ErrorCollector } from "./collectors/error";
export type {
  MonitorConfig,
  BaseReportData,
  ErrorData,
  Framework,
  ReportData,
  IReporter,
  MonitorContext,
} from "./types";
export { ReportType, ErrorType } from "./types";
