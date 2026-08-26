import mongoose from "mongoose";
import Visit from "../../models/visit.model.js";
import QRScan from "../../models/qrScan.model.js";
import URL from "../../models/url.model.js";
import QRCode from "../../models/qrCode.model.js";
import type { AnalyticsSourceType, TimeSeriesPoint, TopItemPoint, BreakdownPoint, ScopedStats, DateRange } from "./analytics.types.js";

const getModel = (source: AnalyticsSourceType): mongoose.Model<any> => (source === "url" ? Visit : QRScan);
const getIdField = (source: AnalyticsSourceType): "linkId" | "qrId" => (source === "url" ? "linkId" : "qrId");

const buildMatch = (idField: string, ids: mongoose.Types.ObjectId[] | null, range: DateRange): Record<string, unknown> => {
  const match: Record<string, unknown> = {};

  if (ids !== null) {
    match[idField] = { $in: ids };
  }

  if (range.from || range.to) {
    match.timestamp = {};
    if (range.from) (match.timestamp as Record<string, Date>).$gte = range.from;
    if (range.to) (match.timestamp as Record<string, Date>).$lte = range.to;
  }

  return match;
};

const resolveHumanReadableIds = async (source: AnalyticsSourceType, mongoIds: mongoose.Types.ObjectId[]): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  if (source === "url") {
    const urls = await URL.find({ _id: { $in: mongoIds } }).select("shortId").lean();
    urls.forEach((u) => map.set(u._id.toString(), u.shortId));
  } else {
    const qrs = await QRCode.find({ _id: { $in: mongoIds } }).select("qrId").lean();
    qrs.forEach((q) => map.set(q._id.toString(), q.qrId));
  }

  return map;
};

const getTimeSeries = async (
  source: AnalyticsSourceType,
  ids: mongoose.Types.ObjectId[] | null,
  range: DateRange,
  granularity: "hour" | "day" = "day"
): Promise<TimeSeriesPoint[]> => {
  const model = getModel(source);
  const idField = getIdField(source);
  const match = buildMatch(idField, ids, range);
  const dateFormat = granularity === "hour" ? "%Y-%m-%dT%H:00:00" : "%Y-%m-%d";

  const results = await model.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: dateFormat, date: "$timestamp" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ bucket: r._id, count: r.count }));
};

const getTopItems = async (
  source: AnalyticsSourceType,
  ids: mongoose.Types.ObjectId[] | null,
  range: DateRange,
  limit = 10
): Promise<TopItemPoint[]> => {
  const model = getModel(source);
  const idField = getIdField(source);
  const match = buildMatch(idField, ids, range);

  const results = await model.aggregate([
    { $match: match },
    { $group: { _id: `$${idField}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  if (results.length === 0) return [];

  const labelMap = await resolveHumanReadableIds(source, results.map((r) => r._id));

  return results.map((r) => ({
    label: labelMap.get(r._id.toString()) ?? "Deleted item",
    count: r.count,
  }));
};

const getFieldBreakdown = async (
  source: AnalyticsSourceType,
  ids: mongoose.Types.ObjectId[] | null,
  range: DateRange,
  field: string,
  limit = 10
): Promise<BreakdownPoint[]> => {
  const model = getModel(source);
  const idField = getIdField(source);
  const match = buildMatch(idField, ids, range);

  const results = await model.aggregate([
    { $match: match },
    { $group: { _id: { $ifNull: [`$${field}`, "Unknown"] }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const top = results.slice(0, limit).map((r) => ({ label: r._id as string, count: r.count as number }));
  const otherCount = results.slice(limit).reduce((sum, r) => sum + r.count, 0);

  if (otherCount > 0) {
    top.push({ label: "Other", count: otherCount });
  }

  return top;
};

const getScopedStats = async (source: AnalyticsSourceType, ids: mongoose.Types.ObjectId[] | null, range: DateRange): Promise<ScopedStats> => {
  const model = getModel(source);
  const idField = getIdField(source);
  const match = buildMatch(idField, ids, range);

  const [result] = await model.aggregate([
    { $match: match },
    { $group: { _id: null, totalCount: { $sum: 1 }, firstActivity: { $min: "$timestamp" }, lastActivity: { $max: "$timestamp" } } },
  ]);

  return {
    totalCount: result?.totalCount ?? 0,
    firstActivity: result?.firstActivity ?? null,
    lastActivity: result?.lastActivity ?? null,
  };
};

// Raw event rows for CSV export. includeIp must only ever be passed as true for an admin/super-admin requester.
const getRawEvents = async (source: AnalyticsSourceType, ids: mongoose.Types.ObjectId[] | null, range: DateRange, includeIp: boolean) => {
  const model = getModel(source);
  const idField = getIdField(source);
  const match = buildMatch(idField, ids, range);

  const selection = includeIp
    ? `+ip ${idField} country region city browser os device referrer timestamp`
    : `${idField} country region city browser os device referrer timestamp`;

  const events = await model.find(match).select(selection).sort({ timestamp: -1 }).lean();

  if (events.length === 0) return [];

  const uniqueItemIds = [...new Set(events.map((e: any) => e[idField].toString()))].map((id) => new mongoose.Types.ObjectId(id));
  const labelMap = await resolveHumanReadableIds(source, uniqueItemIds);
  const labelKey = source === "url" ? "shortId" : "qrId";

  return events.map((e: any) => {
    const { _id, [idField]: rawItemId, ...rest } = e;
    return { [labelKey]: labelMap.get(rawItemId.toString()) ?? "Deleted item", ...rest };
  });
};

export { 
    getTimeSeries, 
    getTopItems, 
    getFieldBreakdown, 
    getScopedStats, 
    getRawEvents 
    };