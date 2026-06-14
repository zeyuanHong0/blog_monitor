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
}

export interface ErrorsData {
  list: ErrorList[];
  trend: TrendData;
}

export interface ErrorsResponse extends BaseResponse {
  data: ErrorsData;
}

export interface ErrorsSearchParams {
  startDate: string;
  endDate: string;
  granularity?: "hour" | "day";
}
