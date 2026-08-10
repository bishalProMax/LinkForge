import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { Request, Response } from "express";
import { createStandaloneQR, createLinkedQR, linkExistingQRToNewUrl, getUserQRs, toggleDisableQR, deleteQR, recordQRScan, resolveQRRedirectTarget, getQRStatus, getQRAnalytics, resolveQRFocusPage, getQRDownloadAsset } from "./qr.service.js";
import type { DashboardQRQueryParams } from "./qr.types.js";

// Create a standalone QR code
const handleCreateStandaloneQR = asyncHandler(async (req: Request, res: Response) => {
  try {
    const qrId = await createStandaloneQR({
      destinationURL: req.body.destinationURL,
      userId: req.user!.id,
      title: req.body.title,
      expiration: req.body.expiration,
      customExpiry: req.body.customExpiry,
      design: req.body.design,
    });

    return res.status(201).json({ success: true, qrId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return res.status(400).json({ success: false, message });
  }
});

// Create a QR linked to an existing URL (dashboard "Create QR" action)
const handleCreateLinkedQR = asyncHandler(async (req: Request, res: Response) => {
  try {
    const qrId = await createLinkedQR({
      urlId: req.params.urlId as string,
      userId: req.user!.id,
    });

    return res.status(201).json({ success: true, qrId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return res.status(400).json({ success: false, message });
  }
});

// Link a standalone QR to a brand-new short URL ("Create Short Link" action)
const handleLinkQRToNewUrl = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;

  try {
    const shortId = await linkExistingQRToNewUrl(qrId, req.user!.id);

    return res.status(201).json({ success: true, shortId, redirectUrl: `${process.env.BASE_URL}/url/${shortId}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return res.status(400).json({ success: false, message });
  }
});

// Polling endpoint for generation status
const handleGetQRStatus = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;
  const qr = await getQRStatus(qrId);

  if (!qr) {
    return res.status(404).json({ success: false, message: "QR code not found" });
  }

  return res.status(200).json({ status: qr.status, imageUrl: qr.imageUrl ?? null });
});

// Public redirect handler — logs a scan, never touches URL click counts
const handleRedirectQR = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;
  const target = await resolveQRRedirectTarget(qrId);

  if (!target || target.isDisabled || !target.destination) {
    return res.redirect(`/dashboard?error=${encodeURIComponent("QR code not found or disabled")}`);
  }

  if (target.expiresAt && target.expiresAt <= new Date()) {
    return res.redirect(`/dashboard?error=${encodeURIComponent("This QR code has expired")}`);
  }

  await recordQRScan(target.qrMongoId);
  return res.redirect(target.destination);
});

// Dashboard QR listing page
const handleGetAllQRs = asyncHandler(async (req: Request, res: Response) => {
  const focusQrId = typeof req.query.focus === "string" ? req.query.focus : null;

  let page = Number(req.query.page) || 1;
  const limit = 9;

  const filters: DashboardQRQueryParams = focusQrId
    ? { status: "all", expiry: "all", linked: "all", sortBy: "newest" }
    : {
        search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
        status: typeof req.query.status === "string" ? (req.query.status as any) : "all",
        expiry: typeof req.query.expiry === "string" ? (req.query.expiry as any) : "all",
        linked: typeof req.query.linked === "string" ? (req.query.linked as any) : "all",
        sortBy: typeof req.query.sortBy === "string" ? (req.query.sortBy as any) : "newest",
      };

  let focusNotice: string | null = null;

  if (focusQrId) {
    const resolvedPage = await resolveQRFocusPage(req.user!.id, focusQrId);

    if (resolvedPage) {
      page = resolvedPage;
    } else {
      focusNotice = "This QR code no longer exists.";
    }
  }

  const { data: qrs, total } = await getUserQRs(req.user!.id, page, limit, filters);
  const totalPages = Math.ceil(total / limit);
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  const error = typeof req.query.error === "string" ? req.query.error : focusNotice;

  return res.render("qrDashboard", {
    qrs, currentPage: page, totalPages, total, startIndex, endIndex, filters, error,
    name: req.user!.name, baseUrl: process.env.BASE_URL,
    focusId: focusQrId && !focusNotice ? focusQrId : null,   // NEW
  });
});

const handleToggleDisableQR = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;

  try {
    const updated = await toggleDisableQR(qrId, req.user!.id);
    if (!updated) return res.status(404).json({ success: false, message: "QR code not found" });
    return res.status(200).json({ success: true, message: "QR status updated successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return res.status(400).json({ success: false, message });
  }
});

const handleDeleteQR = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;

  try {
    const deleted = await deleteQR(qrId, req.user!.id);
    if (!deleted) return res.status(404).json({ success: false, message: "QR code not found" });
    return res.status(200).json({ success: true, message: "QR code deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return res.status(400).json({ success: false, message });
  }
});

const handleGetQRAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;
  const result = await getQRAnalytics(qrId);

  if (!result) {
    return res.status(404).json({ message: "QR code not found" });
  }

  return res.status(200).json({ totalScans: result.totalScans, analytics: result.analytics });
});

const handleDownloadQRAsset = asyncHandler(async (req: Request, res: Response) => {
  const qrId = req.params.qrId as string;
  const format = req.params.format as string;

  if (format !== "svg" && format !== "pdf") {
    return res.status(400).json({ success: false, message: "Unsupported format" });
  }

  const asset = await getQRDownloadAsset(qrId, req.user!.id, format);

  if (!asset) {
    return res.status(404).json({ success: false, message: "QR code not found or not ready" });
  }

  res.setHeader("Content-Type", asset.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${qrId}.${asset.extension}"`);
  return res.status(200).send(asset.buffer);
});

export {
  handleCreateStandaloneQR,
  handleCreateLinkedQR,
  handleLinkQRToNewUrl,
  handleGetQRStatus,
  handleRedirectQR,
  handleGetAllQRs,
  handleToggleDisableQR,
  handleDeleteQR,
  handleGetQRAnalytics,
  handleDownloadQRAsset
};