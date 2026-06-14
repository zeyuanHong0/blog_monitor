import request from "@/utils/axios";
import type { ErrorsResponse, ErrorsSearchParams } from "./types";

enum API {
  DASHBOARD_ERRORS = "/dashboard/errors",
}

export const getErrors = (
  params: ErrorsSearchParams,
): Promise<ErrorsResponse> => {
  return request.get(API.DASHBOARD_ERRORS, { params });
};

export const getErrorDetail = (id: string): Promise<ErrorsResponse> => {
  return request.get(`${API.DASHBOARD_ERRORS}/${id}`);
};
