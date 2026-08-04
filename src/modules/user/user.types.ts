// ----------------------------------SaveUser---------------------------------
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export interface UpdateUsernameResult {
  type: "SUCCESS" | "NOT_FOUND";
  name?: string;
  accessToken?: string;
}

export interface ChangePasswordResult {
  type: "SUCCESS" | "NOT_FOUND" | "OLD_PASSWORD_REQUIRED" | "INVALID_OLD_PASSWORD";
  accessToken?: string;
  refreshToken?: string;
}

export interface UpdateDetailsResult {
  type: "SUCCESS" | "NOT_FOUND";
  organization?: string;
  designation?: string;
}
