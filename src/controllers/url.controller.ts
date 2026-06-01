import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs } from "../services/url.service.js";
import type { Request, Response } from "express";


// Generate short URL
const handleGenerateShortURL = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;

  if ( !body.url || !validator.isURL(body.url, { require_protocol: true, protocols: ["http", "https"], require_tld: true})) {
    return res.redirect(`/linkforge?error=${encodeURIComponent("Enter a valid URL (http/https)")}`);
  }

  try {
    const shortid = await generateShortURL({ originalURL: body.url, userId: req.user!.id });

    //PRG(POST -> REDIRECT -> GET): pattern to avoid form resubmission on page refresh
    return res.redirect(`/linkforge/?id=${shortid}`);
  } catch (error) {
    console.error(error);

    return res.redirect(`/linkforge?error=${encodeURIComponent("Something went wrong, please try again")}`);
  }
});


// redirect to original URL
const handleRedirectToURL = asyncHandler(async (req: Request, res: Response)=> {
  const shortId = req.params.shortId as string;
  const entry = await redirectToOriginalURL(shortId);

  if (!entry) {
    return res.redirect(`/linkforge?error=${encodeURIComponent("URL not found")}`);
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
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
});


//get all URLs created by a user
const handleGetAllURL = asyncHandler(async (req: Request, res: Response) => {
  const allUrls = await getUserURLs(req.user!.id);
  const error = typeof req.query.error === "string" ? req.query.error : null;
  const Id = typeof req.query.id === "string" ? req.query.id : null;
  return res.render("dashboard", { Id, urls: allUrls, error});
});

export {
  handleGenerateShortURL,
  handleRedirectToURL,
  handleGetAnalytics,
  handleGetAllURL
};
