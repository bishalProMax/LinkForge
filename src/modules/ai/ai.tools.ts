import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { getAnalyticsOverview } from "../analytics/analytics.service.js";
import { getUserURLs } from "../url/url.service.js";
import { getExpiryDisplay } from "../../shared/utils/expiryDate.js";
import type { ToolContext } from "./ai.types.js";

// it only narrates what getAnalyticsOverview 
const buildAnalyticsSummaryTool = (ctx: ToolContext) =>
  new DynamicStructuredTool({
    name: "get_analytics_summary",
    description: "Fetches the current user's link or QR code analytics — either one specific item (by short code or QR id) or an aggregate across all of their items. Use this before answering any question about clicks, scans, top countries, or best-performing links.",
    schema: z.object({
      type: z
      .enum(["url", "qr"])
      .describe("Whether to look at short links or QR codes"),
      id: z
      .string()
      .optional()
      .describe("A specific short code or QR id, if the user named one. Omit for an overall summary."),
    }),
    func: async ({ type, id }) => {
      const overview = await getAnalyticsOverview({ type, id }, { id: ctx.userId, role: ctx.role });
      if (!overview) return JSON.stringify({ error: "Item not found, or you don't have access to it." });
      return JSON.stringify(overview);
    },
  });

// Lists the user's own links with real pagination.
const LIST_PAGE_SIZE = 50;
const buildListLinksTool = (ctx: ToolContext) =>
  new DynamicStructuredTool({
    name: "list_my_links",
    description: `Lists the current user's own short links with full detail — clickable URL, destination, status, click count, creation date, and expiry. Includes links with zero clicks, unlike the analytics summary. Use this for anything about the links themselves: "show all active links", "which links expire soon", "oldest link", "links created between two dates", "most/least clicked", "find a link by name or destination". ` + `Always include the returned "fullShortUrl" (not the bare short code) when telling the user about a link, so it's clickable. Paginated at ${LIST_PAGE_SIZE} per page — increment "page" from your previous call if the user asks for more.`,
    schema: z.object({
      status: z
      .enum(["active", "disabled", "expired", "all"])
      .optional()
      .describe("Defaults to 'all'."),
      sortBy: z
      .enum(["newest", "oldest", "mostClicked", "leastClicked"])
      .optional()
      .describe("Defaults to 'newest'."),
      search: z
      .string()
      .optional()
      .describe("Match against short code, title, or destination URL."),
      createdFrom: z
      .string()
      .optional()
      .describe("ISO date (YYYY-MM-DD). Links created on/after this date."),
      createdTo: z
      .string()
      .optional()
      .describe("ISO date (YYYY-MM-DD). Links created on/before this date."),
      expiringWithinDays: z
      .number()
      .int()
      .min(1)
      .max(365)
      .optional()
      .describe("Only links expiring within this many days from now."),
      page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(`1-indexed page, ${LIST_PAGE_SIZE} per page. Defaults to 1.`),
    }),
    func: async ({ status, sortBy, search, createdFrom, createdTo, expiringWithinDays, page }) => {
      const currentPage = page ?? 1;
      const { data, total } = await getUserURLs(ctx.userId, currentPage, LIST_PAGE_SIZE, {
        status: status ?? "all",
        sortBy: sortBy ?? "newest",
        search,
        createdFrom,
        createdTo,
        expiringWithinDays,
      });

      const rows = data.map((u: any) => ({
        shortId: u.shortId,
        fullShortUrl: `${process.env.BASE_URL}/url/${u.shortId}`,
        title: u.title,
        destinationURL: u.destinationURL,
        status: u.status,
        totalClicks: u.totalClicks ?? 0,
        createdAt: u.createdAt,
        expiresAt: u.expiresAt,
        expiryText: getExpiryDisplay(u.expiresAt).text,
      }));

      const totalPages = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
      return JSON.stringify({ page: currentPage, totalPages, totalLinks: total, returned: rows.length, hasMore: currentPage < totalPages, links: rows });
    },
  });

export { 
  buildAnalyticsSummaryTool, 
  buildListLinksTool 
  };