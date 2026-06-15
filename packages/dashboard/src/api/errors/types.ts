export interface BaseResponse {
  code: number;
  message: string;
}

export interface ErrorList {
  id: string;
  errorType: string;
  message: string;
  lastSeen: string;
}

export interface ChartItem {
  name: string;
  value: number;
}

export interface TrendSeries {
  name: string;
  data: number[];
}

export interface TrendData {
  dateList: string[];
  jsErrorCountData: TrendSeries;
  promiseErrorCountData: TrendSeries;
  resourceErrorCountData: TrendSeries;
  ajaxErrorCountData: TrendSeries;
  networkErrorCountData: TrendSeries;
  otherErrorCountData: TrendSeries;
}

export interface ErrorsData {
  list: ErrorList[];
  trend: TrendData;
}

export interface ErrorsResponse extends BaseResponse {
  data: ErrorsData;
}

export interface ErrorDetail {
  id: string;
  appId: string;
  errorType: string;
  message: string;
  stack?: string | null;
  filename?: string | null;
  lineno?: number | null;
  colno?: number | null;
  resourceUrl?: string | null;
  framework?: {
    name: 'react' | 'vue';
    componentName?: string;
    componentStack?: string;
    hook?: string;
  } | null;
  url: string;
  sessionId: string;
  createTime: string;
}

export interface ErrorDetailResponse extends BaseResponse {
  data: ErrorDetail;
}

export interface ErrorsSearchParams {
  startDate: string;
  endDate: string;
  granularity?: "hour" | "day";
}
