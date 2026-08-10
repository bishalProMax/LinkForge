import { openModal } from "./modal.js";
import { showToast } from "./toast.js";

const createQrModal = document.getElementById("createQrModal");
const createQrImage = document.getElementById("createQrImage");
const createQrLoader = document.getElementById("createQrLoader");

async function pollStatus(qrId, attempt = 0) {
  const res = await fetch(`/qr/${qrId}/status`);
  const data = await res.json();

  if (data.status === "READY") {
    createQrLoader.style.display = "none";
    createQrImage.src = data.imageUrl;
    createQrImage.style.display = "block";
    return;
  }

  if (data.status === "FAILED") {
    createQrLoader.textContent = "QR generation failed. Please try again.";
    return;
  }

  const delays = [300, 600, 1000, 1500];
  const delay = delays[Math.min(attempt, delays.length - 1)];
  setTimeout(() => pollStatus(qrId, attempt + 1), delay);
}

document.querySelectorAll(".create-qr-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const shortId = button.dataset.shortid;
    button.disabled = true;

    try {
      const res = await fetch(`/url/${shortId}/create-qr`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      createQrImage.style.display = "none";
      createQrLoader.style.display = "flex";
      openModal(createQrModal);
      pollStatus(data.qrId, 0);

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