import request from "@/utils/axios";
import type { TrafficResponse, TrafficSearchParams } from "./types";

enum API {
  DASHBOARD_TRAFFIC = "/dashboard/traffic",
}

export const getTraffic = (
  data: TrafficSearchParams,
): Promise<TrafficResponse> => {
  const { startDate, endDate, granularity } = data;
  return request.get(API.DASHBOARD_TRAFFIC, {
    params: {
      startDate,
      endDate,
      ...(granularity ? { granularity } : {}),
    },
  });
};
