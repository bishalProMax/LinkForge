import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createUrlSchema } from "../url/url.schemas.js";
import { createStandaloneQRSchema } from "../qr/qr.schemas.js";
import { getAnalyticsOverview } from "../analytics/analytics.service.js";
import { getUserURLs, generateShortURL } from "../url/url.service.js";
import { createStandaloneQR } from "../qr/qr.service.js";
import { validateToolInput } from "../../shared/utils/aiGuardrail.js";
import { getExpiryDisplay } from "../../shared/utils/expiryDate.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";
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

  // Most commonly chosen combination in the existing QR editor's option set — a simple static
// default for now; swap for a real popularity query later if usage data justifies it.
const DESIGN_RECOMMENDATION = { fgColor: "#000000", bgColor: "#ffffff", dotStyle: "rounded" as const, frameShape: "round" as const };

const buildCreateLinkTool = (ctx: ToolContext) =>
  new DynamicStructuredTool({
    name: "create_short_link",
    description: "Creates a new short link for the user. Extract as many fields as the user mentioned (URL, custom alias, title, expiration) from their message. To create multiple links, call this tool once per link.",
    schema: z.object({
      destinationURL: z.string().describe("The destination URL to shorten"),
      customAlias: z.string().optional().describe("A custom alias/slug, if the user specified one"),
      title: z.string().optional().describe("A title for the link, if the user specified one"),
      expiration: z.enum(["never", "1d", "3d", "7d", "30d"]).optional().describe("When the link should expire, if mentioned. Defaults to never."),
    }),
    func: async (input) => {
      const validated = validateToolInput(createUrlSchema, { destinationURL: input.destinationURL, customAlias: input.customAlias, title: input.title, expiration: input.expiration ?? "never" });
      if (!validated.success) return JSON.stringify({ error: validated.error });

      try {
        const shortId = await generateShortURL({ destinationURL: validated.data.destinationURL, userId: ctx.userId, customAlias: validated.data.customAlias, title: validated.data.title, expiration: validated.data.expiration, customExpiry: validated.data.customExpiry });
        logSecurityEvent({ event: "AI_ACTION_EXECUTED", userId: ctx.userId, email: ctx.email, ip: ctx.ip,role: ctx.role, metadata: { action: "create_short_link", shortId } }, "info");
        return JSON.stringify({ success: true, shortId, fullUrl: `${process.env.BASE_URL}/url/${shortId}` });
      } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : "Something went wrong." });
      }
    },
  });

const buildCreateQRTool = (ctx: ToolContext) =>
  new DynamicStructuredTool({
    name: "create_qr_code",
    description: "Creates a new standalone QR code for the user. If the user doesn't specify a design (colors, dot pattern, frame shape), use sensible, commonly-chosen defaults and mention what you picked.",
    schema: z.object({
      destinationURL: z.string().describe("The destination URL the QR code should point to"),
      title: z.string().optional(),
      expiration: z.enum(["never", "1d", "3d", "7d", "30d"]).optional(),
      fgColor: z.string().optional().describe("Foreground hex color, e.g. #000000, if the user requested one"),
      bgColor: z.string().optional().describe("Background hex color, if the user requested one"),
      dotStyle: z.enum(["square", "rounded", "dots"]).optional(),
      frameShape: z.enum(["sharp", "round"]).optional(),
    }),
    func: async (input) => {
      const design = {
        fgColor: input.fgColor ?? DESIGN_RECOMMENDATION.fgColor,
        bgColor: input.bgColor ?? DESIGN_RECOMMENDATION.bgColor,
        dotStyle: input.dotStyle ?? DESIGN_RECOMMENDATION.dotStyle,
        frameShape: input.frameShape ?? DESIGN_RECOMMENDATION.frameShape,
      };

      const validated = validateToolInput(createStandaloneQRSchema, { destinationURL: input.destinationURL, title: input.title, expiration: input.expiration ?? "never", design });
      if (!validated.success) return JSON.stringify({ error: validated.error });

      try {
        const qrId = await createStandaloneQR({ destinationURL: validated.data.destinationURL, userId: ctx.userId, title: validated.data.title, expiration: validated.data.expiration, customExpiry: validated.data.customExpiry, design: validated.data.design });
        logSecurityEvent({ event: "AI_ACTION_EXECUTED", userId: ctx.userId, email: ctx.email, ip: ctx.ip, role: ctx.role, metadata: { action: "create_qr_code", qrId } }, "info");
        return JSON.stringify({ success: true, qrId, designUsed: design });
      } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : "Something went wrong." });
      }
    },
  });

export { 
  buildAnalyticsSummaryTool, 
  buildListLinksTool,
  buildCreateLinkTool,
  buildCreateQRTool 
  };   
