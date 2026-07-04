import { openModal, closeModal } from "./modal.js";

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const deleteTitle = document.getElementById("deleteTitle");
const deleteMessage = document.getElementById("deleteMessage");

let selectedShortId = "";

// ---------------- ESCAPE HTML (prevents XSS from user-supplied URLs) ----------------

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------- OPEN MODAL ----------------

document.querySelectorAll(".delete-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedShortId = button.dataset.shortid;

    const originalUrl = button.dataset.url;
    const displayUrl = originalUrl.length > 200 ? `${originalUrl.slice(0, 200)}…` : originalUrl;
    const safeUrl = escapeHtml(displayUrl);

    if (deleteTitle) {
      deleteTitle.textContent = "Delete Link?";
    }

    if (deleteMessage) {
      deleteMessage.innerHTML = `Are you sure you want to delete "<strong>${safeUrl}</strong>"? This action cannot be undone and all analytics associated with this link will be permanently deleted.`;
    }

    openModal(deleteModal);
  });
});

// ---------------- CANCEL ----------------

cancelDeleteBtn?.addEventListener("click", () => {
  selectedShortId = "";

  closeModal(deleteModal);
});

// ---------------- DELETE ----------------

confirmDeleteBtn?.addEventListener("click", async () => {
  if (!selectedShortId) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting...";

  try {
    const response = await fetch(`/url/${selectedShortId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    window.location.reload();
  } catch (error) {
    alert(error instanceof Error ? error.message : "Unable to delete the link.");

    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete";
  }
});