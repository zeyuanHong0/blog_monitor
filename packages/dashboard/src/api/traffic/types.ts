export interface BaseResponse {
  code: number;
  message: string;
}

export interface TopPage {
  url: string;
  count: number;
}

export interface TrendSeries {
  name: string;
  data: number[];
}

export interface TrendData {
  dateList: string[];
  pvData: TrendSeries;
  uvData: TrendSeries;
}

export interface TrafficData {
  trend: TrendData;
  topPages: TopPage[];
  hourlyDistribution: number[];
}

export interface TrafficResponse extends BaseResponse {
  data: TrafficData;
}

export interface TrafficSearchParams {
  startDate: string;
  endDate: string;
  granularity?: "hour" | "day";
}
