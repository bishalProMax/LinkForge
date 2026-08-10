import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";
// ---------------- DISABLE MODAL ----------------

const disableModal = document.getElementById("qrDisableModal");
const disableTitle = document.getElementById("qrDisableTitle");
const disableMessage = document.getElementById("qrDisableMessage");
const confirmDisableBtn = document.getElementById("qrConfirmDisableBtn");
const cancelDisableBtn = document.getElementById("qrCancelDisableBtn");

let selectedDisableQrId = "";

document.querySelectorAll(".qr-disable-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const qrId = button.dataset.qrid;
    const isCurrentlyDisabled = button.dataset.disabled === "true";
    const isLinked = button.dataset.linked === "true";

    selectedDisableQrId = qrId;

    // Enable action — no modal, direct call
    if (isCurrentlyDisabled) {
      toggleDisable(qrId);
      return;
    }

    // Disable action — always confirms
    disableTitle.textContent = "Disable QR Code?";

    disableMessage.textContent = isLinked
      ? "Disabling this will also disable the connected short link, since they're linked."
      : "Disabling this will stop it from working. Analytics won't be touched.";

    openModal(disableModal);
  });
});

cancelDisableBtn?.addEventListener("click", () => {
  selectedDisableQrId = "";
  closeModal(disableModal);
});

confirmDisableBtn?.addEventListener("click", async () => {
  if (!selectedDisableQrId) return;

  confirmDisableBtn.disabled = true;
  confirmDisableBtn.textContent = "Please wait...";

  await toggleDisable(selectedDisableQrId);

  confirmDisableBtn.disabled = false;
  confirmDisableBtn.textContent = "Confirm";
  closeModal(disableModal);
});

async function toggleDisable(qrId) {
  try {
    const response = await fetch(`/qr/${qrId}/disable`, { method: "PATCH" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    window.location.reload();
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Unable to update QR code status.");
  }
}

// ---------------- DELETE MODAL ----------------

const deleteModal = document.getElementById("qrDeleteModal");
const deleteTitle = document.getElementById("qrDeleteTitle");
const deleteMessage = document.getElementById("qrDeleteMessage");
const confirmDeleteBtn = document.getElementById("qrConfirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("qrCancelDeleteBtn");

let selectedDeleteQrId = "";

document.querySelectorAll(".qr-delete-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedDeleteQrId = button.dataset.qrid;
    const isLinked = button.dataset.linked === "true";

    deleteTitle.textContent = "Delete QR Code?";

    deleteMessage.textContent = isLinked ? "Deleting this may also delete the connected short link, since they're linked. This action cannot be undone." : "This action cannot be undone.";

    openModal(deleteModal);
  });
});

cancelDeleteBtn?.addEventListener("click", () => {
  selectedDeleteQrId = "";
  closeModal(deleteModal);
});

confirmDeleteBtn?.addEventListener("click", async () => {
  if (!selectedDeleteQrId) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting...";

  try {
    const response = await fetch(`/qr/${selectedDeleteQrId}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    window.location.reload();
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Unable to delete the QR code.");

    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete";
  }
});

// ---------------- DOWNLOAD DROPDOWN ----------------

document.querySelectorAll(".qr-download-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();

    const menu = trigger.closest(".qr-download-wrap").querySelector(".qr-download-menu");

    document.querySelectorAll(".qr-download-menu.open").forEach((m) => {
      if (m !== menu) m.classList.remove("open");
    });

    menu.classList.toggle("open");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".qr-download-menu.open").forEach((menu) => menu.classList.remove("open"));
});

document.querySelectorAll(".qr-download-option").forEach((option) => {
  option.addEventListener("click", async (e) => {
    e.stopPropagation();

    const qrId = option.dataset.qrid;
    const format = option.dataset.format;
    const card = option.closest(".qr-card");
    const img = card?.querySelector(".qr-thumb img");

    if (format === "png") {
      if (!img) return;

      const downloadUrl = img.src.includes("/upload/") ? img.src.replace("/upload/", "/upload/fl_attachment/") : img.src;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${qrId}.png`;
      link.click();
      return;
    }

    if (format === "jpeg") {
      if (!img) return;
      const jpegUrl = img.src.replace("/upload/", "/upload/f_jpg,fl_attachment/");
      const link = document.createElement("a");
      link.href = jpegUrl;
      link.download = `${qrId}.jpg`;
      link.click();
      return;
    }

    // svg / pdf — backend-generated, requires auth, so fetch + blob download
    try {
      const response = await fetch(`/qr/${qrId}/download/${format}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${qrId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Unable to download this format right now.");
    }
  });
});

// ---------------- SHARE ----------------

document.querySelectorAll(".qr-share-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const card = button.closest(".qr-card");
    const img = card?.querySelector(".qr-thumb img");

    if (!img) {
      showToast("QR code is still generating — try again in a moment.");
      return;
    }

    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      const file = new File([blob], "qr-code.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
  await navigator.share({
    files: [file],
    title: "LinkForge QR Code",
    text: `🔗 Scan the attached QR code to open the link.
          Generated with LinkForge`,
      });

  return;
}

      if (navigator.share) {
        await navigator.share({ title: "QR Code", url: img.src });
        return;
      }

      await navigator.clipboard.writeText(img.src);
      showToast("QR image link copied to clipboard.");
    } catch (error) {
      console.error("Share failed:", error);
    }
  });
});

// ---------------- LINK DETAILS (jump to dashboard) ----------------

document.querySelectorAll(".link-details-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const shortId = button.dataset.shortid;
    if (!shortId) return;
    window.location.href = `/dashboard?focus=${encodeURIComponent(shortId)}`;
  });
});

// ---------------- CREATE SHORT LINK (standalone QR) ----------------

document.querySelectorAll(".create-short-link-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const qrId = button.dataset.qrid;
    button.disabled = true;

    try {
      const response = await fetch(`/qr/${qrId}/link`, { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      showToast(`Short link created: ${result.redirectUrl}`);
      window.location.reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to create short link.");
      button.disabled = false;
    }
  });
});

// ---------------- ANALYTICS (placeholder until the page exists) ----------------

document.querySelectorAll(".qr-analytics-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const qrId = button.dataset.qrid;

    try {
      const response = await fetch(`/qr/${qrId}/analytics`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showToast(`Total scans: ${result.totalScans}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to load analytics.");
    }
  });
});

// ---------------- FILTER MODAL TRIGGER ----------------

document.addEventListener("DOMContentLoaded", () => {
  const triggerBtn = document.getElementById("qrFilterTriggerBtn");
  const filterModal = document.getElementById("qrFilterModal");
  const searchInput = document.getElementById("qrSearchInput");
  const clearBtn = document.getElementById("clearQrSearchBtn");
  const clearAllBtn = document.getElementById("clearAllQrFiltersBtn");

  triggerBtn?.addEventListener("click", () => openModal(filterModal));

  searchInput?.addEventListener("input", () => {
    clearBtn.classList.toggle("is-hidden", !searchInput.value);
  });

  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("is-hidden");
    searchInput.form.submit();
  });

  clearAllBtn?.addEventListener("click", () => {
    window.location.href = "/qr";
  });
});

// ---------------- QR PREVIEW MODAL ----------------
document.querySelectorAll(".qr-thumb-clickable img").forEach((img) => {
  img.addEventListener("click", () => {
    document.getElementById("qrPreviewImage").src = img.src;
    openModal(document.getElementById("qrPreviewModal"));
  });
});
