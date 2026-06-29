import asyncHandler from "../../shared/utils/asyncHandler.js";
import { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs, getTotalUserURLs } from "./url.service.js";
import type { Request, Response } from "express";

// Generate short URL
const handleGenerateShortURL = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;

  try {
    const shortid = await generateShortURL({ originalURL: body.url, userId: req.user!.id, customAlias: body.customAlias });

    //PRG(POST -> REDIRECT -> GET): pattern to avoid form resubmission on page refresh
    return res.redirect(`/dashboard/?id=${shortid}`);
  } 
  catch (error) {

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
  const allUrls = await getUserURLs(req.user!.id, page, limit);  //! non-null assertion operator, used by TS while runtime
  const totalUrls = await getTotalUserURLs(req.user!.id);

  const totalPages = Math.ceil(totalUrls / limit);

  const error = typeof req.query.error === "string" ? req.query.error : null;
  const shortId = typeof req.query.id === "string" ? req.query.id : null;

  return res.render("dashboard", { shortId, urls: allUrls, error, currentPage: page, totalPages });
});

export { 
  handleGenerateShortURL, 
  handleRedirectToURL, 
  handleGetAnalytics, 
  handleGetAllURL 
};
