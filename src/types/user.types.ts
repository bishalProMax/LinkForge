export type SignupUserProps = {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
  ip: string;
};

export type SignupResult = {
      type:
          "CAPTCHA_FAILED"
        | "EMAIL_EXISTS"
        | "RESENT"
        | "PENDING"
        | "LOCAL_PROVIDER_LINKED"
    };

export type LoginUserProps = {
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
export type ForgotPasswordProps = {
  email: string;
};

export type ForgotPasswordResult = {
  type: "SUCCESS"
    | "COOLDOWN_ACTIVE"
    | "USER_NOT_FOUND"
    | "OTP_LIMIT_REACHED"
    | "GOOGLE_LOGIN_REQUIRED"
  cooldown?: number;
};

export type VerifyResetOTPProps = {
  email: string;
  otp: string;
};

export type VerifyOTPResult = {
  type:
    | "SUCCESS"
    | "INVALID_OTP"
    | "OTP_EXPIRED"
    | "TOO_MANY_ATTEMPTS";
};

export type ResetPasswordProps = {
  email: string;
  password: string;
};

export type ResetPasswordResult = {
  type:
    | "SUCCESS"
    | "SESSION_EXPIRED"
    | "SAME_PASSWORD";
};