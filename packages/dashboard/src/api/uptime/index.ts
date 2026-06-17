import request from "@/utils/axios";
import type { UptimeResponse } from "./types";

enum API {
  DASHBOARD_UPTIME = "/dashboard/uptime",
}

export const getUptime = (): Promise<UptimeResponse> => {
  return request.get(API.DASHBOARD_UPTIME);
};
