import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { Request, Response } from "express";
import { getExpiryDisplay } from "../../shared/utils/expiryDate.js";
import { generateShortURL, redirectToOriginalURL, getUserURLs, deleteURL, toggleDisableURL, findURLDocByShortId, resolveFocusPage, editLink, bulkDeleteURLs } from "./url.service.js";
import { createLinkedQR } from "../qr/qr.service.js";
import type { DashboardQueryParams, DashboardURL } from "./url.types.js";

// Generate short URL
const handleGenerateShortURL = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;

  try {
    const shortid = await generateShortURL({ originalURL: body.url, userId: req.user!.id, customAlias: body.customAlias, expiration: body.expiration, customExpiry: body.customExpiry, title: body.title });

    if (body.createQr) {
      const url = await findURLDocByShortId(shortid);
      if (url) {
        await createLinkedQR({ urlId: url._id.toString(), userId: req.user!.id });
      }
    }
    
    //PRG(POST -> REDIRECT -> GET): pattern to avoid form resubmission on page refresh
    return res.redirect(`/dashboard/?id=${shortid}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return res.redirect(`/dashboard?error=${encodeURIComponent(message)}`);
  }
});

// redirect to original URL
const handleRedirectToURL = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;

  const result = await redirectToOriginalURL(shortId, {
    ip: req.ip ?? "",
    userAgent: req.headers["user-agent"],
    referrer: req.headers["referer"] as string | undefined,
  });

  if (result.type === "NOT_FOUND") {
    return res.status(404).render("linkNotFound", {
      reason: "notfound",
      icon: "ri-link-unlink-m",
      badge: "Link Not Found",
      title: "We couldn't find this short link",
      message: "The short link you're looking for may have been removed, or the URL might be incorrect. Double-check the link and try again.",
      identifier: `${process.env.BASE_URL}/url/${shortId}`,
    });
  }

  if (result.type === "DISABLED") {
    return res.status(403).render("linkNotFound", {
      reason: "disabled",
      icon: "ri-forbid-2-line",
      badge: "Link Disabled",
      title: "This short link is currently unavailable",
      message: "The owner has temporarily disabled this link. If you believe this is a mistake, contact whoever shared it with you.",
      identifier: `${process.env.BASE_URL}/url/${shortId}`,
    });
  }

  if (result.type === "EXPIRED") {
    return res.status(410).render("linkNotFound", {
      reason: "expired",
      icon: "ri-time-line",
      badge: "Link Expired",
      title: "This short link is no longer available",
      message: "This link reached its expiration date and can no longer be used to access the destination.",
      identifier: `${process.env.BASE_URL}/url/${shortId}`,
    });
  }

  return res.redirect(result.redirectURL);
});

//get all URLs created by a user
const handleGetAllURL = asyncHandler(async (req: Request, res: Response) => {
  const focusShortId = typeof req.query.focus === "string" ? req.query.focus : null;

  let page = Number(req.query.page) || 1;
  const limit = 6;

  const filters: DashboardQueryParams = focusShortId
    ? { status: "all", expiry: "all", sortBy: "newest" }   // force defaults so the target is guaranteed present
    : {
        search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
        status: typeof req.query.status === "string" ? (req.query.status as any) : "all",
        createdFrom: typeof req.query.createdFrom === "string" ? req.query.createdFrom : undefined,
        createdTo: typeof req.query.createdTo === "string" ? req.query.createdTo : undefined,
        expiry: typeof req.query.expiry === "string" ? (req.query.expiry as any) : "all",
        sortBy: typeof req.query.sortBy === "string" ? (req.query.sortBy as any) : "newest",
      };

  let focusNotice: string | null = null;

  if (focusShortId) {
    const resolvedPage = await resolveFocusPage(req.user!.id, focusShortId);

    if (resolvedPage) {
      page = resolvedPage;
    } else {
      focusNotice = "This link no longer exists.";
    }
  }

  const { data: allUrls, total: totalUrls } = await getUserURLs(req.user!.id, page, limit, filters);

  const totalPages = Math.ceil(totalUrls / limit);
  const startIndex = totalUrls === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalUrls);
  const error = typeof req.query.error === "string" ? req.query.error : focusNotice;
  const shortId = typeof req.query.id === "string" ? req.query.id : null;

  const name = req.user!.name;
  const role = req.user!.role;
  const formattedUrls: DashboardURL[] = allUrls.map((url) => ({
    ...url,
    expiryDisplay: getExpiryDisplay(url.expiresAt),
  }));

  return res.render("dashboard", {shortId, urls: formattedUrls, error, currentPage: page, totalPages, baseUrl: process.env.BASE_URL, startIndex, endIndex, totalUrls, name, role, filters, focusId: focusShortId && !focusNotice ? focusShortId : null });
});

// toggle disable a short URL
const handleToggleDisableURL = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;

  try {
    const updated = await toggleDisableURL(shortId, req.user!.id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "URL status updated successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
});

// delete a short URL and linked QR if any
const handleDeleteURL = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;

  try {
    const deleted = await deleteURL(shortId, req.user!.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
});

// create QR code for a short URL
const handleCreateQRForURL = asyncHandler(async (req: Request, res: Response) => {
  try {
    const shortId = req.params.shortId as string;
    const url = await findURLDocByShortId(shortId);

    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }

    const qrId = await createLinkedQR({ urlId: url._id.toString(), userId: req.user!.id });
    return res.status(201).json({ success: true, qrId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return res.status(400).json({ success: false, message });
  }
});

// show edit link page
const handleShowEditLinkPage = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;
  const url = await findURLDocByShortId(shortId);

  if (!url || url.createdBy.toString() !== req.user!.id) {
    return res.redirect(`/dashboard?error=${encodeURIComponent("Link not found")}`);
  }

  const error = typeof req.query.error === "string" ? req.query.error : null;
  return res.render("editLink", { url, error });
});

//editing page for Short URL
const handleEditURL = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;

  try {
    const newShortId = await editLink(shortId, req.user!.id, req.body);
    return res.redirect(`/dashboard?id=${newShortId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return res.redirect(`/url/${shortId}/edit?error=${encodeURIComponent(message)}`);
  }
});

const handleBulkDeleteURL = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkDeleteURLs(req.body.shortIds, req.user!.id);
  return res.status(200).json({ success: true, ...result });
});

export { 
  handleGenerateShortURL, 
  handleRedirectToURL, 
  handleGetAllURL, 
  handleDeleteURL, 
  handleToggleDisableURL,
  handleCreateQRForURL,
  handleShowEditLinkPage,
  handleEditURL,
  handleBulkDeleteURL
  };
