import { getAuditEvents, getAuditEventsForExport } from "./report.repository.js";
import type { AuditQueryParams } from "./report.types.js";

const getAuditReport = (viewerRole: "ADMIN" | "SUPER_ADMIN", page: number, limit: number, filters: AuditQueryParams) => {
  return getAuditEvents(viewerRole, page, limit, filters);
};

const exportAuditReport = (viewerRole: "ADMIN" | "SUPER_ADMIN", filters: AuditQueryParams) => {
  return getAuditEventsForExport(viewerRole, filters);
};

export { getAuditReport, exportAuditReport };