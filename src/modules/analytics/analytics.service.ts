import mongoose from "mongoose";
import { findURLByShortId, getURLIdsByUserId, countURLStatusByIds } from "../url/url.repository.js";
import { findQRById, getQRIdsByUserId, countQRStatusByIds } from "../qr/qr.repository.js";
import { getTimeSeries, getTopItems, getFieldBreakdown, getScopedStats, getRawEvents } from "./analytics.repository.js";
import type { AnalyticsQueryParams, AnalyticsOverview, Requester, ExportMetric } from "./analytics.types.js";

interface ResolvedScope {
  ids: mongoose.Types.ObjectId[] | null;
  isSingleItem: boolean;
}

const isAdminRole = (role: Requester["role"]): boolean => role === "ADMIN" || role === "SUPER_ADMIN";

const resolveScope = async (params: AnalyticsQueryParams, requester: Requester): Promise<ResolvedScope | null> => {
  const isAdmin = isAdminRole(requester.role);

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

  // Admin/Super Admin searching one specific user's aggregate
  if (isAdmin && params.userId) {
    const ids = params.type === "url" ? await getURLIdsByUserId(params.userId) : await getQRIdsByUserId(params.userId);
    return { ids, isSingleItem: false };
  }

  // Admin/Super Admin platform-wide aggregate — no user searched, no id restriction at all
  if (isAdmin) {
    return { ids: null, isSingleItem: false };
  }

  // Regular user's own "all my links" / "all my QRs" aggregate
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
  const countStatus = params.type === "url" ? countURLStatusByIds : countQRStatusByIds;

  const [stats, statusSummary, timeSeries, geoCountry, geoRegion, geoCity, browsers, os, devices, referrers, topItems] = await Promise.all([
    getScopedStats(params.type, scope.ids, range),
    countStatus(scope.ids),
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
    isSingleItem: scope.isSingleItem,
    stats,
    statusSummary,
    timeSeries,
    geo: { country: geoCountry, region: geoRegion, city: geoCity },
    device: { browsers, os, devices },
    referrers,
    topItems,
  };
};

const getExportData = async (metric: ExportMetric, params: AnalyticsQueryParams, requester: Requester) => {
  const scope = await resolveScope(params, requester);
  if (!scope) return null;

  const range = buildRange(params);

  if (metric === "timeseries") {
    return getTimeSeries(params.type, scope.ids, range, params.granularity ?? "day");
  }

  if (metric === "topItems") {
    return getTopItems(params.type, scope.ids, range);
  }

  return getFieldBreakdown(params.type, scope.ids, range, metric);
};

// Raw per-event rows for export. IP is only ever included when the requester is Admin/Super Admin —
// never reachable by a plain USER role, even indirectly (see design spec, Section 5).
const getRawEventsExport = async (params: AnalyticsQueryParams, requester: Requester) => {
  const scope = await resolveScope(params, requester);
  if (!scope) return null;

  const range = buildRange(params);
  const includeIp = isAdminRole(requester.role);

  return getRawEvents(params.type, scope.ids, range, includeIp);
};

export { 
  getAnalyticsOverview, 
  getExportData, 
  resolveScope, 
  buildRange,
  getRawEventsExport
  };