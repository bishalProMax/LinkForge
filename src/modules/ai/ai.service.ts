import { HumanMessage as HM, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import type { DynamicStructuredTool } from "@langchain/core/tools";
import llm from "../../infrastructure/configs/langchain.config.js";
import { checkShortIdExists } from "../url/url.repository.js";
import { buildAnalyticsSummaryTool, buildListLinksTool } from "./ai.tools.js";
import { fetchPageTitle } from "../../shared/services/pageTitleFetcher.js";
import SYSTEM_PROMPT from "../../shared/utils/systemPrompt.js";
import logger from "../../infrastructure/configs/logger.config.js";
import type { ChatMessageInput, ToolContext } from "./ai.types.js";

//plain objects are converted to langchain message objects
const buildMessageHistory = (history: ChatMessageInput[] = []) => {
  return history.map((m) => (m.role === "user" ? new HM(m.content) : new AIMessage(m.content)));
};

const MAX_TOOL_ITERATIONS = 4;

const sendChatMessage = async (message: string, history: ChatMessageInput[], ctx: ToolContext): Promise<string> => {
  const tools = [buildAnalyticsSummaryTool(ctx), buildListLinksTool(ctx)];
  const modelWithTools = llm.bindTools(tools);
  const toolMap = new Map<string, DynamicStructuredTool<any>>( tools.map((t) => [t.name as string, t as DynamicStructuredTool<any>]) );

  const messages: (SystemMessage | HM | AIMessage | ToolMessage)[] = [new SystemMessage(SYSTEM_PROMPT), ...buildMessageHistory(history), new HM(message)];

  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await modelWithTools.invoke(messages);
      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        return response.text ?? (response.content as string);
      }

      for (const call of response.tool_calls) {
        const tool = toolMap.get(call.name);
        const rawResult = tool ? await tool.invoke(call.args as any) : JSON.stringify({ error: "Unknown tool" });

        messages.push(
          new ToolMessage({
            content: typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult),
            tool_call_id: call.id as string,
          })
        );
      }
    }

    return "I wasn't able to finish that — could you try rephrasing your request?";
  } catch (error) {
    logger.error({ err: error }, "AI chat model call failed");
    throw new Error("The assistant is unavailable right now. Please try again in a moment.");
  }
};


// generates alias suggestions for a given destination URL, filtering out any that already exist in the database
const generateAliasSuggestions = async (destinationURL: string, count = 5): Promise<string[]> => {
  const prompt = `Suggest ${count + 3} short, URL-safe slug ideas (lowercase, letters/numbers/hyphens only, 3-20 characters, no spaces) for a link shortener alias, based on this destination URL: ${destinationURL}. Reply with ONLY the slugs, one per line, no numbering, no extra text.`;

  const response = await llm.invoke([new HM(prompt)]);
  const candidates = (response.content as string)
    .split("\n")
    .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))
    .filter((s) => s.length >= 3 && s.length <= 20);

  const available: string[] = [];
  for (const candidate of candidates) {
    if (available.length >= count) break;
    const exists = await checkShortIdExists(candidate);
    if (!exists) available.push(candidate);
  }

  return available;
};

// generates title suggestions for a given destination URL, using the real page title if available, or falling back to generic suggestions based on the URL structure
const generateTitleSuggestions = async (destinationURL: string, count = 3): Promise<string[]> => {
  const realTitle = await fetchPageTitle(destinationURL);

  const prompt = realTitle ? `The destination page's actual title is: "${realTitle}". Suggest ${count} short, clean variations of this title suitable for a link dashboard (3-60 characters each). Reply with ONLY the titles, one per line.`
  : `Suggest ${count} short, generic titles (3-60 characters each) for a link pointing to: ${destinationURL}. Since the page content isn't known, keep suggestions general and based only on the URL structure. Reply with ONLY the titles, one per line.`;

  const response = await llm.invoke([new HM(prompt)]);
  return (response.content as string).split("\n").map((s) => s.trim()).filter((s) => s.length >= 3 && s.length <= 60).slice(0, count);
};

export { 
  sendChatMessage, 
  generateAliasSuggestions, 
  generateTitleSuggestions 
  };
