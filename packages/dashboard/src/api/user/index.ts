import request from "@/utils/axios";
import type { SignInData } from "./types";

export * from "./types";

enum API {
  SIGNIN = "/auth/signin",
  LOGOUT = "/auth/signout",
  USER_PROFILE = "/user/profile",
}

/**
 * 登录用户
 * @param data
 * @returns
 */
export const fetchLogin = (data: SignInData) => {
  return request.post(API.SIGNIN, data);
};

/**
 * 获取用户信息
 * @returns 获取用户信息
 */
export const fetchUserInfo = () => {
  return request.get(API.USER_PROFILE);
};

/**
 * 退出登录
 * @returns 用户登出
 */
export const fetchLogout = () => {
  return request.post(API.LOGOUT);
};
