import type { SecurityEventType } from "../../shared/types/securityEvent.types.js";

export interface AuditQueryParams {
  event?: SecurityEventType | "all";
  email?: string;
  ip?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN" | "all";
  from?: string;
  to?: string;
}

export interface AuditListItem {
  _id: string;
  event: SecurityEventType;
  email?: string;
  userId?: string;
  ip?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  metadata?: Record<string, unknown>;
  createdAt: Date;
}