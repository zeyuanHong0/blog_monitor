export interface BaseResponse {
  code: number;
  message: string;
}

export interface ResponseTrendItem {
  hour: string;
  avgResponseTime: number | null;
  checkCount: number;
}

export interface DayStatus {
  date: string;
  status: "up" | "down" | "noData";
  description: string;
}

export interface FailureRecord {
  id: string;
  targetUrl: string;
  statusCode: number;
  responseTime: number;
  errorMessage: string;
  checkTime: string;
}

export interface UptimeData {
  uptime24h: number;
  responseTrend: ResponseTrendItem[];
  dailyStatus: DayStatus[];
  sslExpiry: string | null;
  failureRecords: FailureRecord[];
}

export interface UptimeResponse extends BaseResponse {
  data: UptimeData;
}
