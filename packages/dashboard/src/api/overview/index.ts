import request from "@/utils/axios";

enum API {
  DASHBOARD_OVERVIEW = "/dashboard/overview",
}

export const getOverview = () => {
  return request.get(API.DASHBOARD_OVERVIEW);
};
