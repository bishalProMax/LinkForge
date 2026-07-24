import type { SecurityEventType } from "./securityEvent.types.js";

export interface SendVerificationEmailJob {
  email: string;
  name: string;
  verificationLink: string;
};

export interface SendWelcomeEmailJob {
  email: string;
  name: string;
  loginLink: string;
};

export interface SendPasswordResetOTPJob {
  email: string;
  name: string;
  otp: string;
};

export interface SendPasswordChangedEmailJob {
  email: string;
  name: string;
};

export type EmailJobData = 
| SendVerificationEmailJob 
| SendWelcomeEmailJob 
| SendPasswordResetOTPJob 
| SendPasswordChangedEmailJob 
| SendRoleInviteEmailJob;

export interface CleanupJob {
  triggeredBy: "cron";
};

export interface SecurityEventJob {
  event: SecurityEventType;
  email?: string;
  userId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
};

export interface SendRoleInviteEmailJob {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  invitedByName: string;
  signupLink: string;
};