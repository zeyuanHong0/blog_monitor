import { create } from "zustand";

import {
  type SignInData,
  type UserProfile,
  fetchLogin,
  fetchLogout,
  fetchUserInfo,
} from "@/api/user";
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from "@/utils/storage";

export type UserState = {
  isLoginExpired: boolean;
  userInfo: UserProfile;
  isAdmin: boolean | null;
  setLoginExpired: (expired: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  userLogin: (data: SignInData) => Promise<any>;
  getUserInfo: () => Promise<any>;
  userLogout: () => Promise<string>;
};

const useUserStore = create((set: any): UserState => {
  return {
    isLoginExpired: false, // 登录是否过期
    userInfo: JSON.parse(getLocalStorage("userInfo") || "{}"),
    isAdmin: null,
    setIsAdmin: (isAdmin: boolean) => {
      set({ isAdmin });
    },
    setLoginExpired: (expired: boolean) => {
      set({ isLoginExpired: expired });
    },
    userLogin: async (data: SignInData) => {
      const res: any = await fetchLogin(data);
      return res;
    },
    getUserInfo: async () => {
      const res: any = await fetchUserInfo();
      set({ userInfo: res.data.userInfo });
      setLocalStorage("userInfo", JSON.stringify(res.data.userInfo));
      return res;
    },
    userLogout: async () => {
      await fetchLogout();
      set({ userInfo: {}, isAdmin: null });
      removeLocalStorage("userInfo");
      return "success";
    },
  };
});

export default useUserStore;
