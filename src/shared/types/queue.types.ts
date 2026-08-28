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

export interface SendAccountBannedEmailJob {
  email: string;
  name: string;
  termsLink: string;
};

export interface SendAccountReinstatedEmailJob {
  email: string;
  name: string;
  loginLink: string;
};

export type EmailJobData = 
| SendVerificationEmailJob 
| SendWelcomeEmailJob 
| SendPasswordResetOTPJob 
| SendPasswordChangedEmailJob 
| SendRoleInviteEmailJob
| SendAccountBannedEmailJob
| SendAccountReinstatedEmailJob;

export interface CleanupJob {
  triggeredBy: "cron";
};

export interface SecurityEventJob {
  event: SecurityEventType;
  email?: string;
  userId?: string;
  ip?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  metadata?: Record<string, unknown>;
};

export interface SendRoleInviteEmailJob {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  invitedByName: string;
  signupLink: string;
};

export interface QRGenerationJob {
  qrId: string;
}

export interface QRAssetCleanupJob {
  cloudinaryPublicId: string;
}

export interface VisitEnrichmentJob {
  linkId: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
}

export interface QRScanEnrichmentJob {
  qrId: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
}

export interface RetentionCleanupJob {
  triggeredBy: "cron";
}

export interface SendAccountDeletionWarningEmailJob {
  email: string;
  name: string;
  deletionDate: string;
  loginLink: string;
}