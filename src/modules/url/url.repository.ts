import URL from "../../models/url.model.js";
import mongoose from "mongoose";
import type { CreateShortURLData } from "./url.types.js";


const checkShortIdExists = (shortId: string) => {
  return URL.findOne({ shortId });
};

const createShortURL = (data: CreateShortURLData) => {
  return URL.create(data);
};

const findURLByShortId = (shortId: string) => {
  return URL.findOne({ shortId });
};

const getURLsByUserId = (userId: string,page: number,limit: number) => {
  return URL.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $lookup: {
        from: "visits",
        localField: "_id",
        foreignField: "linkId",
        as: "visits",
      },
    },

    {
      $addFields: {
        totalClicks: {
          $size: "$visits", //$ means Take the value inside visits
        },
      },
    },

    {
      $project: {
        visits: 0,
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $skip: (page - 1) * limit,
    },

    {
      $limit: limit,
    },
  ]);
};

const countURLsByUserId = (userId: string) => {
  return URL.countDocuments({
    createdBy: userId,
  });
};

const deleteURLByShortId = (shortId: string) => {
  return URL.findOneAndDelete({
    shortId,
  });
}


export { 
  checkShortIdExists, 
  createShortURL, 
  findURLByShortId, 
  getURLsByUserId, 
  countURLsByUserId,
  deleteURLByShortId
  };
