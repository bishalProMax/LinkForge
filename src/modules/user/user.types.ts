// ----------------------------------Login/Signup---------------------------------
export interface SignupUserProps {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
  ip: string;
};

export interface SignupResult {
      type:
          "CAPTCHA_FAILED"
        | "EMAIL_EXISTS"
        | "RESENT"
        | "PENDING"
        | "LOCAL_PROVIDER_LINKED"
        | "COOLDOWN_ACTIVE"
        | "RESEND_LIMIT_REACHED"
        | "INVITE_ACCEPTED"
      cooldown?: number;
    };

export interface LoginUserProps {
  email: string;
  password: string;
  ip: string;
};

export type LoginResult = {
      type:
          "EMAIL_NOT_FOUND"
        | "NOT_VERIFIED"
        | "INVALID_PASSWORD"
        | "TOO_MANY_ATTEMPTS"
        | "GOOGLE_LOGIN_REQUIRED"
        | "ACCOUNT_BANNED";
      retryAfter?: number;
    }
  | {
      type: "SUCCESS";
      accessToken: string;
      refreshToken: string;
    };

export type VerifyEmailResult = {
      type: "INVALID_TOKEN";
    }
  | {
      type: "SUCCESS";
    };


// ----------------------------------Forgot Password---------------------------------
export interface ForgotPasswordProps {
  email: string;
  ip: string;
};

export interface ForgotPasswordResult {
  type: "SUCCESS"
    | "COOLDOWN_ACTIVE"
    | "USER_NOT_FOUND"
    | "OTP_LIMIT_REACHED"
    | "GOOGLE_LOGIN_REQUIRED"
  cooldown?: number;
};

export interface VerifyResetOTPProps {
  email: string;
  otp: string;
  ip: string
};

export interface VerifyOTPResult {
  type:
    | "SUCCESS"
    | "INVALID_OTP"
    | "OTP_EXPIRED"
    | "TOO_MANY_ATTEMPTS";
};

export interface ResetPasswordProps {
  email: string;
  password: string;
  ip: string;
};

export interface ResetPasswordResult {
  type:
    | "SUCCESS"
    | "SESSION_EXPIRED"
    | "SAME_PASSWORD";
};

// ----------------------------------SaveUser---------------------------------
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export interface CreateInviteProps {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  invitedById: string;
  invitedByName: string;
}

export interface CreateInviteResult {
  type: "SUCCESS" | "EMAIL_ALREADY_REGISTERED" | "INVITE_ALREADY_EXISTS";
}

export interface BanActionProps {
  targetUserId: string;
  actingUser: { id: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" };
}

export interface BanActionResult {
  type:
    | "SUCCESS"
    | "NOT_FOUND"
    | "SELF_BAN_FORBIDDEN"
    | "INSUFFICIENT_AUTHORITY"
    | "ALREADY_IN_STATE"; 
}

export interface RoleChangeActionProps {
  targetUserId: string;
  actingUser: { id: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" };
}

export interface RoleChangeActionResult {
  type:
    | "SUCCESS"
    | "NOT_FOUND"
    | "INVALID_TARGET_ROLE" 
    | "INSUFFICIENT_AUTHORITY";
}

export interface GetAllUsersProps {
  actingUserRole: "ADMIN" | "SUPER_ADMIN";
  page: number;
  limit: number;
}

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isBanned: boolean;
  createdAt: Date;
}