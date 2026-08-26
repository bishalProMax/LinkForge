import type { Request, Response } from "express";
import { format } from "fast-csv";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getAuditReport, exportAuditReport } from "./report.service.js";
import type { AuditQueryParams } from "./report.types.js";

const handleGetAuditReport = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;

  const filters: AuditQueryParams = {
    event: typeof req.query.event === "string" ? (req.query.event as any) : "all",
    role: typeof req.query.role === "string" ? (req.query.role as any) : "all",
    email: typeof req.query.email === "string" ? req.query.email.trim() : undefined,
    ip: typeof req.query.ip === "string" ? req.query.ip.trim() : undefined,
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
  };

  const viewerRole = req.user!.role as "ADMIN" | "SUPER_ADMIN";
  const { data, total } = await getAuditReport(viewerRole, page, limit, filters);
  const totalPages = Math.ceil(total / limit);

  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return res.render("adminReports", {events: data, filters, currentPage: page, totalPages, total, startIndex, endIndex, viewerRole})
});

const handleExportAuditCSV = asyncHandler(async (req: Request, res: Response) => {
  const filters: AuditQueryParams = {
    event: typeof req.query.event === "string" ? (req.query.event as any) : "all",
    role: typeof req.query.role === "string" ? (req.query.role as any) : "all",
    email: typeof req.query.email === "string" ? req.query.email.trim() : undefined,
    ip: typeof req.query.ip === "string" ? req.query.ip.trim() : undefined,
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
  };

  const viewerRole = req.user!.role as "ADMIN" | "SUPER_ADMIN";
  const cursor = exportAuditReport(viewerRole, req.user!.id, req.ip ?? "", req.user!.email, filters);

  const filename = `audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const csvStream = format({ headers: ["Event", "Role", "Email", "UserId", "IP", "CreatedAt"] });
  csvStream.pipe(res);

  for await (const e of cursor) {
    csvStream.write({
      Event: e.event,
      Role: e.role ?? "",
      Email: e.email ?? "",
      UserId: e.userId ?? "",
      IP: e.ip ?? "",
      CreatedAt: new Date(e.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    });
  }

  csvStream.end();
});

export { 
  handleGetAuditReport, 
  handleExportAuditCSV 
  };