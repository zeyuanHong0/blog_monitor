import { BlogMonitor } from "./core";
export const version = "0.1.0";
export { BlogMonitor };
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
