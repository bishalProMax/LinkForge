import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { sendChatMessage, generateAliasSuggestions, generateTitleSuggestions } from "./ai.service.js";
import { buildPdfFromText } from "../../shared/utils/textPdf.js";

// handles the /ai/chat endpoint, sending a user message to the AI model and returning the AI's reply
const handleAIChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  try {
    const reply = await sendChatMessage(message.trim(), Array.isArray(history) ? history : [], { userId: req.user!.id, email: req.user!.email, ip: req.ip ?? "", role: req.user!.role });
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(503).json({ success: false, message: error instanceof Error ? error.message : "Assistant unavailable." });
  }
});

// handles generating a PDF from the provided summary text and returning it as a downloadable file
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

// handles generating alias suggestions for a given destination URL
const handleGenerateAlias = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  if (typeof url !== "string" || !url) return res.status(400).json({ success: false, message: "A destination URL is required." });

  const suggestions = await generateAliasSuggestions(url);
  return res.status(200).json({ success: true, suggestions });
});

// handles generating title suggestions for a given destination URL
const handleGenerateTitle = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  if (typeof url !== "string" || !url) return res.status(400).json({ success: false, message: "A destination URL is required." });

  const suggestions = await generateTitleSuggestions(url);
  return res.status(200).json({ success: true, suggestions });
});

export { 
  handleAIChatMessage, 
  handleExportAISummaryPDF,
  handleGenerateAlias,
  handleGenerateTitle 
};