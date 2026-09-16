import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { sendChatMessage } from "./ai.service.js";
import { buildPdfFromText } from "../../shared/utils/textPdf.js";

const handleAIChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  try {
    const reply = await sendChatMessage(message.trim(), Array.isArray(history) ? history : [], { userId: req.user!.id, role: req.user!.role });
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(503).json({ success: false, message: error instanceof Error ? error.message : "Assistant unavailable." });
  }
});

const handleExportAISummaryPDF = asyncHandler(async (req: Request, res: Response) => {
  const { text, title } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ success: false, message: "Summary text is required." });
  }

  const pdfBuffer = await buildPdfFromText(typeof title === "string" && title ? title : "LinkForge Analytics Summary", text);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="analytics-summary.pdf"`);
  return res.status(200).send(pdfBuffer);
});

export { 
  handleAIChatMessage, 
  handleExportAISummaryPDF 
};