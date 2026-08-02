import { getAuditEvents } from "./report.repository.js";
import type { AuditQueryParams } from "./report.types.js";

const getAuditReport = (viewerRole: "ADMIN" | "SUPER_ADMIN", page: number, limit: number, filters: AuditQueryParams) => {
  return getAuditEvents(viewerRole, page, limit, filters);
};

export { getAuditReport };