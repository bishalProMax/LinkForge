import URL from "../models/url.model.js";

const checkShortIdExists = (shortId) => {
  return URL.findOne({ shortId });
};

const createShortURL = (data) => {
  return URL.create(data);
};

const updateVisitHistory = (shortId) => {
  return URL.findOneAndUpdate(
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
};

const findURLByShortId = (shortId) => {
  return URL.findOne({ shortId });
};

const getURLsByUserId = (userId) => {
  return URL.find({
    createdBy: userId,
  });
};

export {
  checkShortIdExists,
  createShortURL,
  updateVisitHistory,
  findURLByShortId,
  getURLsByUserId,
};
