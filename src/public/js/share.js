import { showToast } from "./toast.js";

async function shareQRImage(imageUrl, destination) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], "qr-code.png", { type: "image/png" });
    const text = destination
      ? `🔗 Scan the attached QR code to open: ${destination}`
      : "🔗 Scan the attached QR code to open the link.\nGenerated with LinkForge";

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "LinkForge QR Code", text });
      return;
    }

    if (navigator.share) {
      await navigator.share({ title: "QR Code", url: imageUrl });
      return;
    }

    await navigator.clipboard.writeText(imageUrl);
    showToast("QR image link copied to clipboard.", "success");
  } catch (error) {
    console.error("Share failed:", error);
  }
}

async function shareLink(url, title = "LinkForge Short Link") {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard.", "success");
  } catch (error) {
    console.error("Share failed:", error);
  }
}

export { shareQRImage, shareLink };