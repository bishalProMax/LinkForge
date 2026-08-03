import SecurityEvent from "../../models/securityEvent.model.js";
import type { AuditQueryParams, AuditListItem } from "./report.types.js";

const SUPER_ADMIN_ONLY_EVENTS = ["ROLE_INVITE_CREATED", "ROLE_PROMOTED", "ROLE_DEMOTED"];

//audit events for admin and super admin
const getAuditEvents = async (viewerRole: "ADMIN" | "SUPER_ADMIN", page: number, limit: number, filters: AuditQueryParams = {}): Promise<{ data: AuditListItem[]; total: number }> => {
  const match: Record<string, unknown> = {};

  if (viewerRole === "ADMIN") {
    match.$and = [
      { event: { $nin: SUPER_ADMIN_ONLY_EVENTS } },
      {
        $or: [
          { event: { $nin: ["USER_BANNED", "USER_UNBANNED"] } },
          { event: { $in: ["USER_BANNED", "USER_UNBANNED"] }, "metadata.targetRole": "USER" },
        ],
      },
    ];
  }

  if (filters.event && filters.event !== "all") {
    match.event = filters.event;
  }

  if (filters.email) {
    match.email = { $regex: filters.email, $options: "i" };
  }

  if (filters.ip) {
    match.ip = filters.ip;
  }

  if (filters.from || filters.to) {
    match.createdAt = {};
    if (filters.from) (match.createdAt as any).$gte = new Date(filters.from);
    if (filters.to) (match.createdAt as any).$lte = new Date(filters.to);
  }

  const [data, total] = await Promise.all([
    SecurityEvent.find(match)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(),
    SecurityEvent.countDocuments(match),
  ]);

  return { data: data as unknown as AuditListItem[], total };
};

//for csv export of audit events
const getAuditEventsForExport = async (viewerRole: "ADMIN" | "SUPER_ADMIN", filters: AuditQueryParams = {}): Promise<AuditListItem[]> => {
  const match: Record<string, unknown> = {};

  if (viewerRole === "ADMIN") {
    match.$and = [
      { event: { $nin: SUPER_ADMIN_ONLY_EVENTS } },
      {
        $or: [
          { event: { $nin: ["USER_BANNED", "USER_UNBANNED"] } },
          { event: { $in: ["USER_BANNED", "USER_UNBANNED"] }, "metadata.targetRole": "USER" },
        ],
      },
    ];
  }

  if (filters.event && filters.event !== "all") {
    match.event = filters.event;
  }

  if (filters.email) {
    match.email = { $regex: filters.email, $options: "i" };
  }

  if (filters.ip) {
    match.ip = filters.ip;
  }

  if (filters.from || filters.to) {
    match.createdAt = {};
    if (filters.from) (match.createdAt as any).$gte = new Date(filters.from);
    if (filters.to) (match.createdAt as any).$lte = new Date(filters.to);
  }

  const data = await SecurityEvent.find(match).sort({ createdAt: -1 }).limit(5000).lean();

  return data as unknown as AuditListItem[];
};

export { 
  getAuditEvents, 
  getAuditEventsForExport 
  };