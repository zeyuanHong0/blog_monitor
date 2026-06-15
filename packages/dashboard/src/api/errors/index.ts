import request from "@/utils/axios";
import type {
  ErrorsResponse,
  ErrorDetailResponse,
  ErrorsSearchParams,
} from "./types";

enum API {
  DASHBOARD_ERRORS = "/dashboard/errors",
}

export const getErrors = (
  params: ErrorsSearchParams,
): Promise<ErrorsResponse> => {
  return request.get(API.DASHBOARD_ERRORS, { params });
};

export const getErrorDetail = (id: string): Promise<ErrorDetailResponse> => {
  return request.get(`${API.DASHBOARD_ERRORS}/${id}`);
};
