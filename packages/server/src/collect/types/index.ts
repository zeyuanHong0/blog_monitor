// 上报数据枚举类型
export enum ReportType {
  PAGEVIEW = 'pageview',
  PERFORMANCE = 'performance',
  SOFT_NAVIGATION = 'soft_navigation',
  ERROR = 'error',
  EVENT = 'event',
}

// 基础上报数据结构
export interface BaseReportData {
  type: ReportType;
  appId: string;
  sessionId: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

// 页面访问数据
export interface PageViewData extends BaseReportData {
  type: ReportType.PAGEVIEW;
  referrer: string;
  title: string;
}

// hard-navigation性能数据
export interface PerformanceData extends BaseReportData {
  type: ReportType.PERFORMANCE;
  fcp: number | null; // 页面第一次渲染出内容的时间
  lcp: number | null; // 最大内容块渲染完成的时间
  inp: number | null; // 交互到下一帧绘制延迟
  cls: number | null; // 页面布局抖动的程度
  ttfb: number | null; // 服务器响应第一个字节的时间
}

// soft-navigation数据
export interface SoftNavigationData extends BaseReportData {
  type: ReportType.SOFT_NAVIGATION;
  fromUrl: string; // 导航来源 URL
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  navigationDuration: number | null; // 路由切换耗时
}

// 错误类型枚举
export enum ErrorType {
  JS = 'js', // 同步运行时错误
  PROMISE = 'promise', // 未捕获 Promise
  RESOURCE = 'resource', // 静态资源加载失败
  AJAX = 'ajax', // 有响应（4xx / 5xx）
  NETWORK = 'network', // 无响应（timeout / 断网）
  FRAMEWORK = 'framework', // 框架错误（React/Vue）
  CUSTOM = 'custom', // 手动上报
  UNKNOWN = 'unknown', // 未知错误
}

// 框架类型
export interface Framework {
  name: 'react' | 'vue';
  componentName?: string;
  componentStack?: string; // React
  hook?: string; // Vue
}

// 错误数据
export interface ErrorData extends BaseReportData {
  type: ReportType.ERROR;
  errorType: ErrorType;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  resourceUrl?: string; // 资源加载失败时的 URL
  framework?: Framework;
}

// 自定义事件数据
export interface EventData extends BaseReportData {
  type: ReportType.EVENT;
  eventName: string;
  eventData: Record<string, any>;
}

export type ReportData =
  | PageViewData
  | PerformanceData
  | SoftNavigationData
  | ErrorData
  | EventData;
