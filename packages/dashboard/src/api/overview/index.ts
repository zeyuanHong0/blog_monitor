import request from "@/utils/axios";
import type { OverviewResponse } from "./types";

enum API {
  DASHBOARD_OVERVIEW = "/dashboard/overview",
}

export const getOverview = (): Promise<OverviewResponse> => {
  return request.get(API.DASHBOARD_OVERVIEW);
};
