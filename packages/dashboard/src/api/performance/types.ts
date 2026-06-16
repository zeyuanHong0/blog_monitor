export interface BaseResponse {
  code: number;
  message: string;
}

export interface PerformanceSearchParams {
  startDate: string;
  endDate: string;
  navigationType?: "soft" | "hard" | "all";
  granularity?: "hour" | "day";
}

export interface PerformanceCards {
  avgLcp?: number | null;
  avgCls?: number | null;
  avgInp?: number | null;
  avgNavDuration?: number | null;
  avgTtfb?: number | null;
  avgFcp?: number | null;
  sampleCount: number;
}

export interface PerformanceTrend {
  xData: string[];
  series: { name: string; data: number[] }[];
}

export interface SlowPage {
  url: string;
  fromUrl?: string;
  avgLcp: number | null;
  avgNavDuration?: number | null;
  avgFcp?: number | null;
  avgTtfb?: number | null;
  avgInp?: number | null;
  sampleCount: number;
}

export interface PerformanceData {
  cards: PerformanceCards;
  trend: PerformanceTrend;
  slowPages: SlowPage[];
}

export interface PerformanceResponse extends BaseResponse {
  data: PerformanceData;
}
