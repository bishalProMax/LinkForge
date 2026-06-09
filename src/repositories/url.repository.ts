import URL from "../models/url.model.js";

type CreateShortURLData = {
  shortId: string;
  redirectURL: string;
  visitHistory: {
    timestamp: number;
  }[];
  createdBy: string;
};

const checkShortIdExists = (shortId: string) => {
  return URL.findOne({ shortId });
};

const createShortURL = (data: CreateShortURLData) => {
  return URL.create(data);
};

const updateVisitHistory = (shortId: string) => {
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

const findURLByShortId = (shortId: string) => {
  return URL.findOne({ shortId });
};

const getURLsByUserId = (userId: string, page: number, limit: number) => {
  return URL.find({
    createdBy: userId,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const countURLsByUserId = (userId: string) => {
  return URL.countDocuments({
    createdBy: userId,
  });
};

export { 
  checkShortIdExists, 
  createShortURL, 
  updateVisitHistory, 
  findURLByShortId, 
  getURLsByUserId, 
  countURLsByUserId 
};
