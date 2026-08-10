import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";

const disableModal = document.getElementById("disableModal");
const disableTitle = document.getElementById("disableTitle");
const disableMessage = document.getElementById("disableMessage");
const confirmDisableBtn = document.getElementById("confirmDisableBtn");
const cancelDisableBtn = document.getElementById("cancelDisableBtn");

let selectedShortId = "";

document.querySelectorAll(".disable-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const shortId = button.dataset.shortid;
    const isCurrentlyDisabled = button.dataset.disabled === "true";
    const isLinked = button.dataset.linked === "true";

    selectedShortId = shortId;

    if (isCurrentlyDisabled) {
      toggleDisable(shortId);
      return;
    }

    disableTitle.textContent = "Disable Link?";
    disableMessage.textContent = isLinked
      ? "Disabling this will also disable the connected QR code, since they're linked."
      : "Disabling this will stop it from working. Analytics won't be touched.";

    openModal(disableModal);
  });
});

cancelDisableBtn?.addEventListener("click", () => {
  selectedShortId = "";
  closeModal(disableModal);
});

confirmDisableBtn?.addEventListener("click", async () => {
  if (!selectedShortId) return;

  confirmDisableBtn.disabled = true;
  confirmDisableBtn.textContent = "Please wait...";

  await toggleDisable(selectedShortId);

  confirmDisableBtn.disabled = false;
  confirmDisableBtn.textContent = "Confirm";
  closeModal(disableModal);
});

async function toggleDisable(shortId) {
  try {
    const response = await fetch(`/url/${shortId}/disable`, { method: "PATCH" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    window.location.reload();
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Unable to update link status.");
  }
}