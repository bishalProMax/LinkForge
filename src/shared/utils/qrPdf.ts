import { PDFDocument } from "pdf-lib";

export const buildPdfFromPng = async (pngBuffer: Buffer): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBuffer);

  const page = pdfDoc.addPage([pngImage.width + 60, pngImage.height + 60]);
  page.drawImage(pngImage, { x: 30, y: 30, width: pngImage.width, height: pngImage.height });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};