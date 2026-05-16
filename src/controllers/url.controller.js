import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs } from "../services/url.service.js";

// Generate short URL
const handleGenerateShortURL = asyncHandler(async (req, res) => {
  const body = req.body;

  if ( !body.url || !validator.isURL(body.url, { require_protocol: true, protocols: ["http", "https"], require_tld: true})) {
    return res.redirect(`/linkforge?error=${encodeURIComponent("Enter a valid URL (http/https)")}`);
  }

  try {
    const shortid = await generateShortURL(body.url, req.user.id);

    //PRG(POST -> REDIRECT -> GET): pattern to avoid form resubmission on page refresh
    return res.redirect(`/linkforge/?id=${shortid}`);
  } catch (error) {
    console.log(error);

    return res.redirect(`/linkforge?error=${encodeURIComponent("Something went wrong, please try again")}`);
  }
});

// redirect to original URL
const handleRedirectToURL = asyncHandler(async (req, res) => {
  const entry = await redirectToOriginalURL(req.params.shortId);

  if (!entry) {
    return res.redirect(`/linkforge?error=${encodeURIComponent("URL not found")}`);
  }

  res.redirect(entry.redirectURL);
});

// get analytics of a short URL
const handleGetAnalytics = asyncHandler(async (req, res) => {
  const result = await getURLAnalytics(req.params.shortId);

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
});

//get all URLs created by a user
const handleGetAllURL = asyncHandler(async (req, res) => {
  const allUrls = await getUserURLs(req.user.id);
  const error = req.query.error || null;
  const Id = req.query.id || null;
  return res.render("home", { Id, urls: allUrls, error});
});

export {
  handleGenerateShortURL,
  handleRedirectToURL,
  handleGetAnalytics,
  handleGetAllURL
};
