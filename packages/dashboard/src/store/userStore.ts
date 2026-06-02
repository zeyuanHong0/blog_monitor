import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  type SignInData,
  type UserProfile,
  type SignInResponse,
  type UserProfileResponse,
  fetchLogin,
  fetchLogout,
  fetchUserInfo,
} from "@/api/user";

export type UserState = {
  userInfo: UserProfile | null;
  isLoginExpired: boolean;
  setLoginExpired: (expired: boolean) => void;
  userLogin: (data: SignInData) => Promise<SignInResponse>;
  getUserInfo: () => Promise<UserProfileResponse>;
  userLogout: () => Promise<"success">;
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      isLoginExpired: false,

      setLoginExpired: (expired: boolean) => set({ isLoginExpired: expired }),

      userLogin: async (data: SignInData) => {
        const res = await fetchLogin(data);
        return res;
      },

      getUserInfo: async () => {
        const res = await fetchUserInfo();
        set({ userInfo: res.data.userInfo });
        return res;
      },

      userLogout: async () => {
        await fetchLogout();
        set({ userInfo: null, isLoginExpired: false });
        return "success";
      },
    }),
    {
      name: "blog-monitor-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: UserState) => ({
        userInfo: state.userInfo,
      }),
      version: 1,
    },
  ),
);

export default useUserStore;
