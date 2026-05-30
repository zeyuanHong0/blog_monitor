export interface SignInData {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  accountType: "admin" | "tourist";
}
