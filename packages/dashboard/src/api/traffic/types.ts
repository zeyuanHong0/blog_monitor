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

// 访客数据
export interface VisitorsData {
  ip: string;
  userAgent: string;
  createTime: string;
  country: string | null;
  province: string | null;
  city: string | null;
  isp: string | null;
}

export interface TrafficData {
  trend: TrendData;
  topPages: TopPage[];
  hourlyDistribution: number[];
  visitors: VisitorsData[];
}

export interface TrafficResponse extends BaseResponse {
  data: TrafficData;
}

export interface TrafficSearchParams {
  startDate: string;
  endDate: string;
  granularity?: "hour" | "day";
}
