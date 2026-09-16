import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import type { DynamicStructuredTool } from "@langchain/core/tools";
import llm from "../../infrastructure/configs/langchain.config.js";
import SYSTEM_PROMPT from "../../shared/utils/systemPrompt.js";
import { buildAnalyticsSummaryTool, buildListLinksTool } from "./ai.tools.js";
import logger from "../../infrastructure/configs/logger.config.js";
import type { ChatMessageInput, ToolContext } from "./ai.types.js";

//plain objects are converted to langchain message objects
const buildMessageHistory = (history: ChatMessageInput[] = []) => {
  return history.map((m) => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)));
};

const MAX_TOOL_ITERATIONS = 4;

const sendChatMessage = async (message: string, history: ChatMessageInput[], ctx: ToolContext): Promise<string> => {
  const tools = [buildAnalyticsSummaryTool(ctx), buildListLinksTool(ctx)];
  const modelWithTools = llm.bindTools(tools);
  const toolMap = new Map<string, DynamicStructuredTool<any>>( tools.map((t) => [t.name as string, t as DynamicStructuredTool<any>]) );

  const messages: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [new SystemMessage(SYSTEM_PROMPT), ...buildMessageHistory(history), new HumanMessage(message)];

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

export { sendChatMessage };
