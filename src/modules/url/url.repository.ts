import URL from "../../models/url.model.js";
import mongoose from "mongoose";
import type { CreateShortURLData, DashboardQueryParams } from "./url.types.js";


const checkShortIdExists = (shortId: string) => {
  return URL.findOne({ shortId });
};

const createShortURL = (data: CreateShortURLData) => {
  return URL.create(data);
};

const findURLByShortId = (shortId: string) => {
  return URL.findOne({ shortId });
};

const getURLsByUserId = (userId: string,page: number,limit: number, filters: DashboardQueryParams = {}) => {

  const matchStage: Record<string, unknown> = {
    createdBy: new mongoose.Types.ObjectId(userId),
  };

  if (filters.search) {
    matchStage.$or = [
      { shortId: { $regex: filters.search, $options: "i" } },
      { redirectURL: { $regex: filters.search, $options: "i" } },
    ];
  }

  return URL.aggregate([
    { 
      $match: matchStage 
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
          $size: "$visits", 
        },
        status: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $ne: ["$expiresAt", null] },
                    { $lte: ["$expiresAt", "$$NOW"] },
                  ],
                },
                then: "expired",
              },
              { case: "$isDisabled", then: "disabled" },
            ],
            default: "active",
          },
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

const countFilteredURLsByUserId = (userId: string, filters: DashboardQueryParams = {}) => {
  const matchStage: Record<string, unknown> = {
    createdBy: new mongoose.Types.ObjectId(userId),
  };

  if (filters.search) {
    matchStage.$or = [
      { shortId: { $regex: filters.search, $options: "i" } },
      { redirectURL: { $regex: filters.search, $options: "i" } },
    ];
  }

  return URL.aggregate([{ $match: matchStage }, { $count: "total" }]);
};

const deleteURLByShortId = (shortId: string) => {
  return URL.findOneAndDelete({
    shortId,
  });
}

const updateURLDisabledStatus = (shortId: string, isDisabled: boolean) => {
  return URL.findOneAndUpdate({ shortId }, { isDisabled }, { returnDocument: "after" });
};


export { 
  checkShortIdExists, 
  createShortURL, 
  findURLByShortId, 
  getURLsByUserId, 
  deleteURLByShortId,
  updateURLDisabledStatus,
  countFilteredURLsByUserId
  };
