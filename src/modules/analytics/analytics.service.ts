import mongoose from "mongoose";
import { findURLByShortId, getURLIdsByUserId } from "../url/url.repository.js";
import { findQRById, getQRIdsByUserId } from "../qr/qr.repository.js";
import { getTimeSeries, getTopItems, getFieldBreakdown, getScopedStats } from "./analytics.repository.js";
import type { AnalyticsQueryParams, AnalyticsOverview, Requester } from "./analytics.types.js";

interface ResolvedScope {
  ids: mongoose.Types.ObjectId[] | null;
  isSingleItem: boolean;
}

const resolveScope = async (params: AnalyticsQueryParams, requester: Requester): Promise<ResolvedScope | null> => {
  const isAdmin = requester.role === "ADMIN" || requester.role === "SUPER_ADMIN";

  if (params.id) {
    if (params.type === "url") {
      const url = await findURLByShortId(params.id);
      if (!url) return null;
      if (!isAdmin && url.createdBy.toString() !== requester.id) return null;
      return { ids: [url._id], isSingleItem: true };
    }

    const qr = await findQRById(params.id);
    if (!qr) return null;
    if (!isAdmin && qr.createdBy.toString() !== requester.id) return null;
    return { ids: [qr._id], isSingleItem: true };
  }

  if (isAdmin && params.userId) {
    const ids = params.type === "url" ? await getURLIdsByUserId(params.userId) : await getQRIdsByUserId(params.userId);
    return { ids, isSingleItem: false };
  }

  if (isAdmin) {
    return { ids: null, isSingleItem: false };
  }

  const ids = params.type === "url" ? await getURLIdsByUserId(requester.id) : await getQRIdsByUserId(requester.id);
  return { ids, isSingleItem: false };
};

const buildRange = (params: AnalyticsQueryParams) => ({
  from: params.from ? new Date(params.from) : undefined,
  to: params.to ? new Date(params.to) : undefined,
});

const getAnalyticsOverview = async (params: AnalyticsQueryParams, requester: Requester): Promise<AnalyticsOverview | null> => {
  const scope = await resolveScope(params, requester);
  if (!scope) return null;

  const range = buildRange(params);
  const granularity = params.granularity ?? "day";

  const [stats, timeSeries, geoCountry, geoRegion, geoCity, browsers, os, devices, referrers, topItems] = await Promise.all([
    getScopedStats(params.type, scope.ids, range),
    getTimeSeries(params.type, scope.ids, range, granularity),
    getFieldBreakdown(params.type, scope.ids, range, "country"),
    getFieldBreakdown(params.type, scope.ids, range, "region"),
    getFieldBreakdown(params.type, scope.ids, range, "city"),
    getFieldBreakdown(params.type, scope.ids, range, "browser"),
    getFieldBreakdown(params.type, scope.ids, range, "os"),
    getFieldBreakdown(params.type, scope.ids, range, "device"),
    getFieldBreakdown(params.type, scope.ids, range, "referrer"),
    scope.isSingleItem ? Promise.resolve([]) : getTopItems(params.type, scope.ids, range),
  ]);

  return {
    stats,
    timeSeries,
    geo: { country: geoCountry, region: geoRegion, city: geoCity },
    device: { browsers, os, devices },
    referrers,
    topItems,
  };
};

export { 
  getAnalyticsOverview, 
  resolveScope, 
  buildRange 
  };