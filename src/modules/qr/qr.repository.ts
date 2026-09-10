import mongoose from "mongoose";
import QRCode from "../../models/qrCode.model.js";
import URL from "../../models/url.model.js";
import type { DashboardQRQueryParams, CreateQRCodeData } from "./qr.types.js";

const checkQrIdExists = (qrId: string) => {
  return QRCode.findOne({ qrId });
};

const createQRCode = (data: CreateQRCodeData) => {
  return QRCode.create(data);
};

const findQRById = (qrId: string) => {
  return QRCode.findOne({ qrId, deletedAt: null });
};

const updateQRStatus = (qrId: string, status: "READY" | "FAILED", imageUrl?: string, cloudinaryPublicId?: string) => {
  return QRCode.findOneAndUpdate({ qrId }, { status, ...(imageUrl ? { imageUrl } : {}), ...(cloudinaryPublicId ? { cloudinaryPublicId } : {}) }, { returnDocument: "after" });
};

const linkQRToUrl = (qrId: string, urlId: string) => {
  return QRCode.findOneAndUpdate({ qrId }, { linkedUrlId: urlId }, { returnDocument: "after" });
};

const updateURLLinkedQR = (urlId: string, qrMongoId: string) => {
  return URL.findByIdAndUpdate(urlId, { linkedQRId: qrMongoId }, { returnDocument: "after" });
};

const updateQRDisabledStatus = (qrId: string, isDisabled: boolean) => {
  return QRCode.findOneAndUpdate({ qrId }, { isDisabled }, { returnDocument: "after" });
};

const getSortStage = (sortBy?: string): Record<string, 1 | -1> => {
  switch (sortBy) {
    case "oldest":
      return { createdAt: 1 };
    case "mostScanned":
      return { totalScans: -1 };
    case "leastScanned":
      return { totalScans: 1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const getQRsByUserId = (userId: string, page: number, limit: number, filters: DashboardQRQueryParams = {}) => {
  const matchStage: Record<string, unknown> = {
    createdBy: new mongoose.Types.ObjectId(userId),
    deletedAt: null,
  };

  if (filters.linked === "linked") {
    matchStage.linkedUrlId = { $ne: null };
  } else if (filters.linked === "standalone") {
    matchStage.linkedUrlId = null;
  }

  if (filters.createdFrom || filters.createdTo) {
    matchStage.createdAt = {};
    if (filters.createdFrom) (matchStage.createdAt as any).$gte = new Date(filters.createdFrom);
    if (filters.createdTo) (matchStage.createdAt as any).$lte = new Date(filters.createdTo);
  }

  const postResolveMatch: Record<string, unknown> = {};

  if (filters.status && filters.status !== "all") {
    postResolveMatch.status = filters.status;
  }

  if (filters.search) {
  postResolveMatch.$or = [
    { qrId: { $regex: filters.search, $options: "i" } },
    { title: { $regex: filters.search, $options: "i" } },
    { destinationURL: { $regex: filters.search, $options: "i" } },
    { linkedShortId: { $regex: filters.search, $options: "i" } },
  ];
  }

  if (filters.expiry === "set") {
    postResolveMatch.expiresAt = { $ne: null };
  } else if (filters.expiry === "never") {
    postResolveMatch.expiresAt = null;
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStage },
    { $lookup: { from: "qrscans", localField: "_id", foreignField: "qrId", as: "scans" } },
    { $lookup: { from: "urls", localField: "linkedUrlId", foreignField: "_id", as: "linkedUrl" } },
    {
      $addFields: {
        totalScans: { $size: "$scans" },
        linkedUrlDoc: { $arrayElemAt: ["$linkedUrl", 0] },
        qrStatus: "$status",
      },
    },
    {
      $addFields: {
        effectiveTitle: { $ifNull: ["$linkedUrlDoc.title", "$title"] },
        effectiveDestination: { $ifNull: ["$linkedUrlDoc.destinationURL", "$destinationURL"] },
        effectiveExpiresAt: { $ifNull: ["$linkedUrlDoc.expiresAt", "$expiresAt"] },
        effectiveIsDisabled: { $ifNull: ["$linkedUrlDoc.isDisabled", "$isDisabled"] },
        linkedShortId: "$linkedUrlDoc.shortId",
        status: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $ne: [{ $ifNull: ["$linkedUrlDoc.expiresAt", "$expiresAt"] }, null] },
                    { $lte: [{ $ifNull: ["$linkedUrlDoc.expiresAt", "$expiresAt"] }, "$$NOW"] },
                  ],
                },
                then: "expired",
              },
              { case: { $ifNull: ["$linkedUrlDoc.isDisabled", "$isDisabled"] }, then: "disabled" },
            ],
            default: "active",
          },
        },
      },
    },
    {
      $addFields: {
        title: "$effectiveTitle",
        destinationURL: "$effectiveDestination",
        expiresAt: "$effectiveExpiresAt",
        isDisabled: "$effectiveIsDisabled",
      },
    },
    ...(Object.keys(postResolveMatch).length > 0 ? [{ $match: postResolveMatch }] : []),
    { $project: { scans: 0, linkedUrl: 0, linkedUrlDoc: 0, effectiveTitle: 0, effectiveDestination: 0, effectiveExpiresAt: 0, effectiveIsDisabled: 0 } },
    {
      $facet: {
        data: [{ $sort: getSortStage(filters.sortBy) }, { $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  return QRCode.aggregate(pipeline);
};

const countQRsNewerThan = (userId: string, createdAt: Date) => {
  return QRCode.countDocuments({ createdBy: new mongoose.Types.ObjectId(userId), createdAt: { $gt: createdAt }, deletedAt: null });
};

const updateQRBasicInfo = (qrId: string, data: { title?: string; destinationURL?: string; expiresAt?: Date }) => {
  return QRCode.findOneAndUpdate({ qrId }, data, { returnDocument: "after" });
};

const updateQRDesignFields = (qrId: string, design: Partial<import("../../models/qrCode.model.js").IQRDesign>) => {
  const setFields: Record<string, unknown> = { status: "PENDING" };
  for (const [key, value] of Object.entries(design)) {
    if (value !== undefined) setFields[`design.${key}`] = value;
  }
  return QRCode.findOneAndUpdate({ qrId }, { $set: setFields }, { returnDocument: "after" });
};

const getQRIdsByUserId = async (userId: string): Promise<mongoose.Types.ObjectId[]> => {
  const qrs = await QRCode.find({ createdBy: userId, deletedAt: null }).select("_id").lean(); 
  return qrs.map((q) => q._id as mongoose.Types.ObjectId);
};

const countQRStatusByIds = async (ids: mongoose.Types.ObjectId[] | null): Promise<{ active: number; expired: number; disabled: number }> => {
  const baseMatch: Record<string, unknown> = ids ? { _id: { $in: ids } } : {};

  const results = await QRCode.aggregate([
    { $match: baseMatch },
    { $lookup: { from: "urls", localField: "linkedUrlId", foreignField: "_id", as: "linkedUrl" } },
    { $addFields: { linkedUrlDoc: { $arrayElemAt: ["$linkedUrl", 0] } } },
    {
      $addFields: {
        effectiveExpiresAt: { $ifNull: ["$linkedUrlDoc.expiresAt", "$expiresAt"] },
        effectiveIsDisabled: { $ifNull: ["$linkedUrlDoc.isDisabled", "$isDisabled"] },
      },
    },
    {
      $addFields: {
        status: {
          $switch: {
            branches: [
              { case: { $and: [{ $ne: ["$effectiveExpiresAt", null] }, { $lte: ["$effectiveExpiresAt", "$$NOW"] }] }, then: "expired" },
              { case: "$effectiveIsDisabled", then: "disabled" },
            ],
            default: "active",
          },
        },
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = { active: 0, expired: 0, disabled: 0 };
  results.forEach((r) => {
    counts[r._id as "active" | "expired" | "disabled"] = r.count;
  });
  return counts;
};

//used by worker for hard delete single QR
const deleteQRByQrId = (qrId: string) => {
  return QRCode.findOneAndDelete({ qrId });
};

//used by worker for hard delete all QR in an Account
const deleteAllQRCodesByUserId = (userId: string) => {
  return QRCode.deleteMany({ createdBy: userId });
};

//soft delete QR before hard delete
const softDeleteQRById = (id: string, deletedBy: string) => {
  return QRCode.findByIdAndUpdate(id, { deletedAt: new Date(), deletedBy }, { returnDocument: "after" });
};

const findQRByIdAdmin = (qrId: string) => {
  return QRCode.findOne({ qrId });
};

const findStatusesByQrIds = async (qrIds: string[]): Promise<Map<string, string>> => {
  const docs = await QRCode.find({ qrId: { $in: qrIds } }).select("qrId status").lean();
  return new Map(docs.map((q) => [q.qrId, q.status]));
};

export { 
  checkQrIdExists, 
  createQRCode, 
  findQRById, 
  updateQRStatus, 
  linkQRToUrl, 
  updateURLLinkedQR, 
  updateQRDisabledStatus, 
  deleteQRByQrId, 
  getQRsByUserId, 
  countQRsNewerThan,
  updateQRBasicInfo,
  updateQRDesignFields,
  getQRIdsByUserId,
  countQRStatusByIds,
  softDeleteQRById,
  findQRByIdAdmin,
  deleteAllQRCodesByUserId,
  findStatusesByQrIds
  };
