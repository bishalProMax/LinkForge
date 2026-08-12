import { openModal } from "./modal.js";
import { showToast } from "./toast.js";
import { shareQRImage } from "./share.js";

const createQrModal = document.getElementById("createQrModal");
const createQrImage = document.getElementById("createQrImage");
const createQrLoader = document.getElementById("createQrLoader");
const createQrDestinationRow = document.getElementById("createQrDestinationRow");
const createQrDestination = document.getElementById("createQrDestination");
const shareCreatedQRBtn = document.getElementById("shareCreatedQR");

const MIN_LOADER_MS = 500;

function revealCreatedQR(imageUrl, destination) {
  createQrImage.onload = () => {
    createQrLoader.style.display = "none";
    createQrImage.style.display = "block";

    if (destination) {
      createQrDestination.textContent = destination;
      createQrDestinationRow.style.display = "flex";
    }

    shareCreatedQRBtn.style.display = "flex";
    shareCreatedQRBtn.dataset.imageUrl = imageUrl;
    shareCreatedQRBtn.dataset.destination = destination;
  };

  createQrImage.src = imageUrl;
}

async function pollStatus(qrId, destination, attempt = 0, startedAt = Date.now()) {
  const res = await fetch(`/qr/${qrId}/status`);
  const data = await res.json();

  if (data.status === "READY") {
    const elapsed = Date.now() - startedAt;
    setTimeout(() => revealCreatedQR(data.imageUrl, destination), Math.max(0, MIN_LOADER_MS - elapsed));
    return;
  }

  if (data.status === "FAILED") {
    createQrLoader.textContent = "QR generation failed. Please try again.";
    return;
  }

  const delays = [300, 600, 1000, 1500];
  setTimeout(() => pollStatus(qrId, destination, attempt + 1, startedAt), delays[Math.min(attempt, delays.length - 1)]);
}

document.querySelectorAll(".create-qr-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const shortId = button.dataset.shortid;
    const row = document.querySelector(`tr[data-shortid="${shortId}"]`);
    const destinationEl = row?.querySelector(".redirect-link");
    const destination = destinationEl ? destinationEl.href : "";

    button.disabled = true;

    try {
      const res = await fetch(`/url/${shortId}/create-qr`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      createQrImage.style.display = "none";
      createQrDestinationRow.style.display = "none";
      shareCreatedQRBtn.style.display = "none";
      createQrLoader.textContent = "";
      createQrLoader.style.display = "flex";

      openModal(createQrModal);
      pollStatus(data.qrId, destination, 0);

      button.textContent = "Show QR";
      button.classList.replace("create-qr-btn", "show-qr-tab-btn");
      button.dataset.qrid = data.qrId;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to create QR code.");
    } finally {
      button.disabled = false;
    }
  });
});

shareCreatedQRBtn?.addEventListener("click", () => {
  const imageUrl = shareCreatedQRBtn.dataset.imageUrl;
  const destination = shareCreatedQRBtn.dataset.destination;
  if (imageUrl) shareQRImage(imageUrl, destination);
});

if (createQrModal) {
  createQrModal.addEventListener("click", (e) => {
    const isCloseTrigger = e.target.closest("[data-close-modal]") || e.target === createQrModal;
    if (isCloseTrigger) {
      window.location.reload();
    }
  });
}