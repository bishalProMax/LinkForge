import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { getAnalyticsOverview } from "../analytics/analytics.service.js";

interface ToolContext {
  userId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}

// Calls the existing analytics module's aggregation output directly — the model never invents
// numbers, it only narrates what getAnalyticsOverview actually returns.
const buildAnalyticsSummaryTool = (ctx: ToolContext) =>
  new DynamicStructuredTool({
    name: "get_analytics_summary",
    description: "Fetches the current user's link or QR code analytics — either one specific item (by short code or QR id) or an aggregate across all of their items. Use this before answering any question about clicks, scans, top countries, or best-performing links.",
    schema: z.object({
      type: z.enum(["url", "qr"]).describe("Whether to look at short links or QR codes"),
      id: z.string().optional().describe("A specific short code or QR id, if the user named one. Omit for an overall summary."),
    }),
    func: async ({ type, id }) => {
      const overview = await getAnalyticsOverview({ type, id }, { id: ctx.userId, role: ctx.role });
      if (!overview) return JSON.stringify({ error: "Item not found, or you don't have access to it." });
      return JSON.stringify(overview);
    },
  });

export { buildAnalyticsSummaryTool };
export type { ToolContext };