// ----------------------------------Login/Signup/logout---------------------------------
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
        | "LOCAL_AUTH_LINKED"
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
        | "LOGIN_TOO_MANY_ATTEMPTS"
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

export interface LogoutUserProps {
  refreshCookie?: string;
  userId: string;
  email: string;
  ip: string;
  }

  // ----------------------------------Forgot Password---------------------------------
  export interface ForgotPasswordProps {
    email: string;
    ip: string;
  };
  
  export interface ForgotPasswordResult {
    type: "SUCCESS"
      | "OTP_COOLDOWN_ACTIVE"
      | "USER_NOT_FOUND"
      | "OTP_LIMIT_REACHED"
      | "LOCAL_AUTH_REQUIRED"
      | "ACCOUNT_BANNED"
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
      | "OTP_TOO_MANY_ATTEMPTS";
  };
  
  export interface ResetPasswordProps {
    email: string;
    password: string;
    ip: string;
  };
  
  export interface ResetPasswordResult {
    type:
      | "SUCCESS"
      | "PASSWORD_RESET_SESSION_EXPIRED"
      | "PASSWORD_RESET_SAME_PASSWORD";
  };