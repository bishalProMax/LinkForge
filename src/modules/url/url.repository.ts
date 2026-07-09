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

const getSortStage = (sortBy?: string): Record<string, 1 | -1> => {
  switch (sortBy) {
    case "oldest":
      return { createdAt: 1 };
    case "mostClicked":
      return { totalClicks: -1 };
    case "leastClicked":
      return { totalClicks: 1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const getURLsByUserId = (userId: string, page: number, limit: number, filters: DashboardQueryParams = {}) => {
  const matchStage: Record<string, unknown> = {
    createdBy: new mongoose.Types.ObjectId(userId),
  };

  if (filters.search) {
    matchStage.$or = [{ shortId: { $regex: filters.search, $options: "i" } }, { redirectURL: { $regex: filters.search, $options: "i" } }];
  }

  if (filters.createdFrom || filters.createdTo) {
    matchStage.createdAt = {};
    if (filters.createdFrom) (matchStage.createdAt as any).$gte = new Date(filters.createdFrom);
    if (filters.createdTo) (matchStage.createdAt as any).$lte = new Date(filters.createdTo);
  }

  if (filters.expiry === "set") {
    matchStage.expiresAt = { $ne: null };
  } else if (filters.expiry === "never") {
    matchStage.expiresAt = null;
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStage },
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
        totalClicks: { $size: "$visits" },
        status: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $ne: ["$expiresAt", null] }, { $lte: ["$expiresAt", "$$NOW"] }],
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
    ...(filters.status && filters.status !== "all" ? [{ $match: { status: filters.status } }] : []),
    { $project: { visits: 0 } },
    {
      $facet: {
        data: [{ $sort: getSortStage(filters.sortBy) }, { $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  return URL.aggregate(pipeline);
};

const deleteURLByShortId = (shortId: string) => {
  return URL.findOneAndDelete({
    shortId,
  });
};

const updateURLDisabledStatus = (shortId: string, isDisabled: boolean) => {
  return URL.findOneAndUpdate({ shortId }, { isDisabled }, { returnDocument: "after" });
};

export { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, deleteURLByShortId, updateURLDisabledStatus };
