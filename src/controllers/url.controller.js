const shortid = require("shortid");
const URL = require("../models/url.models.js");
const asyncHandler = require("../utils/asyncHandler.js");
const validator = require("validator");

// Generate short URL
const handleGenerateNewShortURL = asyncHandler(async (req, res) => {
  const body = req.body;

  if (
    !body.url ||
    !validator.isURL(body.url, {
      require_protocol: true,
      protocols: ["http", "https"],
      require_tld: true,
    })
  ) {
    return res.redirect(
      `/linkforge?error=${encodeURIComponent("Enter a valid URL (http/https)")}`
    );
  }

  let shortID;
  let exists;

  do {
    shortID = shortid.generate();
    exists = await URL.findOne({ shortId: shortID });
  } while (exists);

  try {
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user.id,
    });

    //PRG(POST -> REDIRECT -> GET): pattern to avoid form resubmission on page refresh
    return res.redirect(`/linkforge/?id=${shortID}`);
  } catch (error) {
    return res.redirect(
      `/linkforge?error=${encodeURIComponent("Something went wrong, please try again")}`
    );
  }
});

// redirect to original URL
const handleRedirectToURL = asyncHandler(async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (!entry) {
    return res.redirect(
      `/linkforge?error=${encodeURIComponent("URL not found")}`
    );
  }

  res.redirect(entry.redirectURL);
});

// get analytics of a short URL
const handleGetAnalytics = asyncHandler(async (req, res) => {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
});

//get all URLs created by a user
const handleGetAllURL = asyncHandler(async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const allUrls = await URL.find({ createdBy: req.user.id });
  const error = req.query.error || null;
  const Id = req.query.id || null;
  return res.render("home", { Id, urls: allUrls, error });
});

module.exports = {
  handleGenerateNewShortURL,
  handleRedirectToURL,
  handleGetAnalytics,
  handleGetAllURL,
};
