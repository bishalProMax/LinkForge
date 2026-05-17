export type SignupUserProps = {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
  ip: string;
};

export type SignupResult =
   {
      type:
          "CAPTCHA_FAILED"
        | "EMAIL_EXISTS"
        | "RESENT"
        | "PENDING";
    };

export type LoginUserProps = {
  email: string;
  password: string;
};

export type LoginResult =
    {
      type:
          "EMAIL_NOT_FOUND"
        | "NOT_VERIFIED"
        | "INVALID_PASSWORD";
    }
  | {
      type: "SUCCESS";
      token: string;
    };

export type VerifyEmailResult =
    {
      type: "INVALID_TOKEN";
    }
  | {
      type: "SUCCESS";
    };
