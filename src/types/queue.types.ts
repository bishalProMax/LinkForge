export type SendVerificationEmailJob = {
  email: string;
  name: string;
  verificationLink: string;
};

export type SendWelcomeEmailJob = {
  email: string;
  name: string;
  loginLink: string;
};

export type CleanupJob = {
  triggeredBy: "cron";
};

export type SendPasswordResetOTPJob = {
  email: string;
  name: string;
  otp: string;
};
export type SendPasswordChangedEmailJob = {
  email: string;
  name: string;
  loginLink: string;
};