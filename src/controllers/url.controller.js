const shortid = require("shortid");
const URL = require("../models/url.models.js");
const asyncHandler = require("../utils/asyncHandler.js");

// Generate short URL
const handleGenerateNewShortURL = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body.url) {
    return res.status(400).json({ error: " url is required" });
  }

  const shortID = shortid.generate();

  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
  });

//   const allUrls = await URL.find({})

//   return res.render("home", { 
//     Id: shortID,
//     urls: allUrls
// });
return res.redirect(`/?id=${shortID}`)
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

  if (!entry) return res.status(404).send("URL not found");

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

const handleGetAllURL = asyncHandler(async (req, res) => {
  const allUrls = await URL.find({});
  const Id = req.query.id || null
  return res.render("home", { Id, urls: allUrls });
});

module.exports = {
  handleGenerateNewShortURL,
  handleRedirectToURL,
  handleGetAnalytics,
  handleGetAllURL,
};
