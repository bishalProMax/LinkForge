import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { sendChatMessage } from "./ai.service.js";

const handleAIChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  try {
    const reply = await sendChatMessage(message.trim(), Array.isArray(history) ? history : []);
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(503).json({ success: false, message: error instanceof Error ? error.message : "Assistant unavailable." });
  }
});

export { handleAIChatMessage };