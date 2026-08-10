import QRCode from "qrcode";
import sharp from "sharp";
import type { IQRDesign } from "../../models/qrCode.model.js";

const MODULE_SIZE = 10;      // px per QR module
const QUIET_ZONE = 4;        // modules of blank padding around the QR itself
const FRAME_PADDING = 20;    // extra px around the quiet zone, part of the frame

// Renders one QR "module" (a single dark cell) as an SVG shape, per dot style.
const buildModuleShape = (x: number, y: number, size: number, dotStyle: IQRDesign["dotStyle"]): string => {
  switch (dotStyle) {
    case "dots": {
      const r = size / 2;
      return `<circle cx="${x + r}" cy="${y + r}" r="${r * 0.85}" />`;
    }
    case "rounded": {
      const r = size * 0.28;
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" ry="${r}" />`;
    }
    case "square":
    default:
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" />`;
  }
};

// Builds the full SVG string for a QR code: modules + frame, per the given design.
const buildQRSvg = (data: string, design: IQRDesign): string => {
  const qr = QRCode.create(data, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;
  const modules = qr.modules.data;

  const contentSize = (moduleCount + QUIET_ZONE * 2) * MODULE_SIZE;
  const totalSize = contentSize + FRAME_PADDING * 2;
  const offset = FRAME_PADDING + QUIET_ZONE * MODULE_SIZE;

  let shapes = "";

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = modules[row * moduleCount + col] & 1;
      if (!isDark) continue;

      const x = offset + col * MODULE_SIZE;
      const y = offset + row * MODULE_SIZE;
      shapes += buildModuleShape(x, y, MODULE_SIZE, design.dotStyle);
    }
  }

  const frameRadius = design.frameShape === "round" ? Math.round(totalSize * 0.08) : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
  <rect x="0" y="0" width="${totalSize}" height="${totalSize}" rx="${frameRadius}" ry="${frameRadius}" fill="${design.bgColor}" />
  <g fill="${design.fgColor}">${shapes}</g>
</svg>`;
};

// Rasterizes an SVG string to a PNG buffer, ready for Cloudinary upload.
const rasterizeSvgToPng = async (svg: string): Promise<Buffer> => {
  return sharp(Buffer.from(svg)).png().toBuffer();
};

export { 
  buildQRSvg, 
  rasterizeSvgToPng 
  };