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
        | "RESEND_LIMIT_REACHED";
      cooldown?: number;
    };

export interface LoginUserProps {
  email: string;
  password: string;
};

export type LoginResult = {
      type:
          "EMAIL_NOT_FOUND"
        | "NOT_VERIFIED"
        | "INVALID_PASSWORD"
        | "TOO_MANY_ATTEMPTS"
        | "GOOGLE_LOGIN_REQUIRED";
      retryAfter?: number;
    }
  | {
      type: "SUCCESS";
      token: string;
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
};