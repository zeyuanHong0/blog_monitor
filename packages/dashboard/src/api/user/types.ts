export interface BaseResponse {
  code: number;
  message: string;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  accountType: "admin" | "tourist";
}

export type SignInResponse = BaseResponse;

export interface UserProfileResponse extends BaseResponse {
  data: {
    userInfo: UserProfile;
  };
}

export type SignOutResponse = BaseResponse;
