import request from "@/utils/axios";
import type { PerformanceResponse, PerformanceSearchParams } from "./types";

enum API {
  DASHBOARD_PERFORMANCE = "/dashboard/performance",
}

export const getPerformance = (
  data: PerformanceSearchParams,
): Promise<PerformanceResponse> => {
  const { startDate, endDate, navigationType, granularity } = data;
  return request.get(API.DASHBOARD_PERFORMANCE, {
    params: {
      startDate,
      endDate,
      ...(navigationType ? { navigationType } : {}),
      ...(granularity ? { granularity } : {}),
    },
  });
};
