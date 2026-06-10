export interface BaseResponse {
  code: number;
  message: string;
}

export interface TopPage {
  url: string;
  count: number;
}

export interface LatestError {
  id: string;
  errorType: string;
  message: string;
  url: string;
  createTime: string;
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
  pvData: TrendSeries;
  uvData: TrendSeries;
  errorCountData: TrendSeries;
}

export interface OverviewTodayData {
  pv: number;
  uv: number;
  errorCount: number;
  topPages: TopPage[];
  browserDistribution: ChartItem[];
  deviceDistribution: ChartItem[];
}

export interface OverviewData {
  today: OverviewTodayData;
  uptime: number;
  latestErrors: LatestError[];
  trend: TrendData;
}

export interface OverviewResponse extends BaseResponse {
  data: OverviewData;
}
