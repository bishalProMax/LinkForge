import { openModal, closeModal } from "./modal.js";

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const deleteTitle = document.getElementById("deleteTitle");
const deleteMessage = document.getElementById("deleteMessage");

let selectedShortId = "";

// ---------------- OPEN MODAL ----------------

document.querySelectorAll(".delete-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedShortId = button.dataset.shortid;

    const originalUrl = button.dataset.url;

    if (deleteTitle) {
      deleteTitle.textContent = "Delete Link?";
    }

    if (deleteMessage) {
      deleteMessage.textContent = `Are you sure you want to delete "${originalUrl}"? This action cannot be undone and all analytics associated with this link will be permanently deleted.`;
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
