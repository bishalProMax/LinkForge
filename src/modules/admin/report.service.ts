import { getAuditEvents, getAuditEventsCursorForExport } from "./report.repository.js";
import type { AuditQueryParams } from "./report.types.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";

const getAuditReport = (viewerRole: "ADMIN" | "SUPER_ADMIN", page: number, limit: number, filters: AuditQueryParams) => {
  return getAuditEvents(viewerRole, page, limit, filters);
};

const exportAuditReport = (viewerRole: "ADMIN" | "SUPER_ADMIN", viewerUserId: string, viewerIp: string, viewerEmail: string, filters: AuditQueryParams) => {
  logSecurityEvent({ event: "AUDIT_REPORT_EXPORTED", userId: viewerUserId, ip: viewerIp, email: viewerEmail, role: viewerRole }, "info");
  return getAuditEventsCursorForExport(viewerRole, filters);
};

export { getAuditReport, exportAuditReport };