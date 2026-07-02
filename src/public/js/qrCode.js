/* global QRCode */

import { openModal } from "./modal.js";

// ---------------- DOM ELEMENTS ----------------

const qrModal = document.getElementById("qrModal");
const qrCanvas = document.getElementById("qrCanvas");
const qrLoader = document.getElementById("qrLoader");

const downloadBtn = document.getElementById("downloadQR");
const shareBtn = document.getElementById("shareQR");

// ---------------- QR STATE ----------------

const qrState = {
  url: "",
  id: "",
};

// ---------------- SHOW QR ----------------

function showQR(button) {
  if (!button || !qrModal || !qrCanvas || !qrLoader) {
    return;
  }

  const shortId = button.dataset.id;

  if (!shortId) {
    return;
  }

  const fullUrl = `${window.location.origin}/url/${shortId}`;

  qrState.url = fullUrl;
  qrState.id = shortId;

  openModal(qrModal);

  qrLoader.style.display = "flex";

  qrCanvas.classList.remove("show");

  QRCode.toCanvas(qrCanvas, fullUrl, (error) => {
    if (error) {
      console.error("QR generation failed:", error);
      return;
    }

    setTimeout(() => {
      qrLoader.style.display = "none";
      qrCanvas.classList.add("show");
    }, 250);
  });
}

// ---------------- QR BUTTON ----------------

document.querySelectorAll(".qr-btn").forEach((button) => {
  button.addEventListener("click", () => {
    showQR(button);
  });
});

// ---------------- DOWNLOAD ----------------

downloadBtn?.addEventListener("click", () => {
  if (!qrCanvas) {
    return;
  }

  const link = document.createElement("a");

  link.download = `${qrState.id}.png`;

  link.href = qrCanvas.toDataURL("image/png");

  link.click();
});

// ---------------- SHARE ----------------

shareBtn?.addEventListener("click", async () => {
  if (!qrCanvas) {
    return;
  }

  try {
    qrCanvas.toBlob(async (blob) => {
      if (!blob) {
        return;
      }

      const file = new File([blob], `${qrState.id}.png`, {
        type: "image/png",
      });

      // Share Image

      if (
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          files: [file],
          title: "QR Code",
          text: "Scan this QR Code",
        });

        return;
      }

      // Share URL

      if (navigator.share) {
        await navigator.share({
          title: "Short URL",
          text: "Here is the link",
          url: qrState.url,
        });

        return;
      }

      // Clipboard Fallback

      await navigator.clipboard.writeText(qrState.url);

      alert("Link copied to clipboard.");
    }, "image/png");
  } catch (error) {
    console.error("Share failed:", error);
  }
});
