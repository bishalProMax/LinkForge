import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import chatModel from "../../infrastructure/configs/langchain.config.js";
import SYSTEM_PROMPT from "../../shared/utils/systemPrompt.js";
import logger from "../../infrastructure/configs/logger.config.js";
import type { ChatMessageInput } from "../../shared/types/ai.types.js";

//plain objects are converted to langchain message objects
const buildMessageHistory = (history: ChatMessageInput[] = []) => {
  return history.map((m) => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)));
};


const sendChatMessage = async (message: string, history: ChatMessageInput[] = []): Promise<string> => {
  const messages = [new SystemMessage(SYSTEM_PROMPT), ...buildMessageHistory(history), new HumanMessage(message)];

  try {
    const response = await chatModel.invoke(messages);
    return response.content as string;
  } catch (error) {
    logger.error({ err: error }, "AI chat model call failed");
    throw new Error("The assistant is unavailable right now. Please try again in a moment.");
  }
};

export { sendChatMessage };