import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getExpiryDisplay } from "../../shared/utils/expiryDate.js";
import { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs, deleteURL, toggleDisableURL, getFilteredTotalUserURLs } from "./url.service.js";
import type { Request, Response } from "express";
import type { DashboardQueryParams, DashboardURL } from "./url.types.js";

// Generate short URL
const handleGenerateShortURL = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;

  try {
    const shortid = await generateShortURL({ originalURL: body.url, userId: req.user!.id, customAlias: body.customAlias, expiration: body.expiration, customExpiry: body.customExpiry });

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
  const entry = await redirectToOriginalURL(shortId);

  if (!entry) {
    return res.redirect(`/dashboard?error=${encodeURIComponent("URL not found")}`);
  }

  res.redirect(entry.redirectURL);
});

// get analytics of a short URL
const handleGetAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const shortId = req.params.shortId as string;
  const result = await getURLAnalytics(shortId);

  if (!result) {
    return res.status(404).json({ message: "URL not found" });
  }

  return res.status(200).json({
    totalClicks: result.totalClicks,
    analytics: result.analytics,
  });
});

//get all URLs created by a user
const handleGetAllURL = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = 6;

  const filters: DashboardQueryParams = {
    search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
  };
  const allUrls = await getUserURLs(req.user!.id, page, limit, filters); //! non-null assertion operator, used by TS while runtime
  const totalUrls = await getFilteredTotalUserURLs(req.user!.id, filters);

  const totalPages = Math.ceil(totalUrls / limit);
  const startIndex = totalUrls === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalUrls);
  const error = typeof req.query.error === "string" ? req.query.error : null;
  const shortId = typeof req.query.id === "string" ? req.query.id : null;

  const username = req.user!.username;
  const formattedUrls: DashboardURL[] = allUrls.map((url) => ({
    ...url,
    expiryDisplay: getExpiryDisplay(url.expiresAt),
  }));

  return res.render("dashboard", { shortId, urls: formattedUrls, error, currentPage: page, totalPages, baseUrl: process.env.BASE_URL, startIndex, endIndex, totalUrls, username, filters });
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

// delete a short URL
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

export { handleGenerateShortURL, handleRedirectToURL, handleGetAnalytics, handleGetAllURL, handleDeleteURL, handleToggleDisableURL };
