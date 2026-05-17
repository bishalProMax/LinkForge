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