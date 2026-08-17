import { openModal, closeModal } from "./modal.js";
import { showToast } from "./toast.js";
import { shareQRImage, shareLink } from "./share.js";
import { pollQRStatus } from "./qrPolling.js";
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

    if (isCurrentlyDisabled) {
      toggleDisable(qrId);
      return;
    }

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

      const downloadUrl = img.src.includes("/upload/") ? img.src.replace("/upload/", `/upload/fl_attachment:${qrId}/`) : img.src;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${qrId}.png`;
      link.click();
      return;
    }

    if (format === "jpeg") {
      if (!img) return;
      const jpegUrl = img.src.replace("/upload/", `/upload/f_jpg,fl_attachment:${qrId}/`);
      const link = document.createElement("a");
      link.href = jpegUrl;
      link.download = `${qrId}.jpg`;
      link.click();
      return;
    }

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

    await shareQRImage(img.src);
  });
});

// ---------------- SHOW LINK  (jump to dashboard) ----------------

document.querySelectorAll(".link-details-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const shortId = button.dataset.shortid;
    if (!shortId) return;
    window.location.href = `/dashboard?focus=${encodeURIComponent(shortId)}`;
  });
});

// ---------------- CREATE SHORT LINK FOR STANDALONE QR ----------------
const createShortLinkModal = document.getElementById("createShortLinkModal");

if (createShortLinkModal) {
  createShortLinkModal.addEventListener("click", (e) => {
    const isCloseTrigger = e.target.closest("[data-close-modal]") || e.target === createShortLinkModal;
    if (isCloseTrigger) {
      window.location.reload();
    }
  });
}

const createdShortLinkUrl = document.getElementById("createdShortLinkUrl");
const createdShortLinkDestination = document.getElementById("createdShortLinkDestination");
const shareCreatedShortLinkBtn = document.getElementById("shareCreatedShortLink");

document.querySelectorAll(".create-short-link-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const qrId = button.dataset.qrid;
    const card = document.querySelector(`.qr-card[data-qrid="${qrId}"]`);
    const destinationEl = card?.querySelector(".qr-destination a");
    const destination = destinationEl ? destinationEl.href : "";

    button.disabled = true;

    try {
      const response = await fetch(`/qr/${qrId}/link`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      createdShortLinkUrl.textContent = result.redirectUrl;
      createdShortLinkDestination.textContent = destination;

      document.getElementById("copyCreatedShortLinkBtn").dataset.url = result.redirectUrl;
      shareCreatedShortLinkBtn.dataset.url = result.redirectUrl;

      openModal(createShortLinkModal);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to create short link.");
    } finally {
      button.disabled = false;
    }
  });
});

shareCreatedShortLinkBtn?.addEventListener("click", () => {
  const url = shareCreatedShortLinkBtn.dataset.url;
  if (url) shareLink(url);
});

// ---------------- ANALYTICS  ----------------

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

// ---------------- QR EDIT BUTTON ----------------
document.querySelectorAll(".edit-qr-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const qrId = button.dataset.qrid;   
    if (!qrId) return;
    window.location.href = `/qr/${qrId}/edit`;   
  });
});

// ---------------- DESIGN FORM + LIVE PREVIEW ----------------
const saveDesignBtn = document.getElementById("saveDesignBtn");

if (saveDesignBtn) {
  const redirectTarget = saveDesignBtn.dataset.redirect;
  let previewTimer = null;

  const getDesign = () => ({
    fgColor: document.getElementById("fgColorHex").value,
    bgColor: document.getElementById("bgColorHex").value,
    dotStyle: document.getElementById("dotStyleGroup").querySelector(".selected")?.dataset.value || "square",
    frameShape: document.getElementById("frameShapeGroup").querySelector(".selected")?.dataset.value || "sharp",
  });

  
  const initialDesign = {
    fgColor: document.getElementById("fgColorHex").value,
    bgColor: document.getElementById("bgColorHex").value,
    dotStyle: document.getElementById("dotStyleGroup").querySelector(".selected")?.dataset.value || "square",
    frameShape: document.getElementById("frameShapeGroup").querySelector(".selected")?.dataset.value || "sharp",
  };

  // ADDED — compares current vs initial, toggles the button
  function checkDesignDirty() {
    const current = getDesign();
    const isDirty = Object.keys(initialDesign).some((key) => current[key] !== initialDesign[key]);
    saveDesignBtn.disabled = !isDirty;
  }

  const updatePreview = () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      try {
        const res = await fetch("/qr/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ redirectTarget, design: getDesign() }),
        });
        document.getElementById("qrPreviewBox").innerHTML = await res.text();
      } catch {
        //
      }
    }, 200);
  };

  function setupColorField(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;

    picker.addEventListener("input", () => {
      hex.value = picker.value;
      updatePreview();
      checkDesignDirty();  
    });

    hex.addEventListener("input", () => {
      let value = hex.value.trim();
      if (!value.startsWith("#")) value = `#${value}`;
      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        picker.value = value;
        updatePreview();
        checkDesignDirty();   
      }
    });
  }

  setupColorField("fgColorPicker", "fgColorHex");
  setupColorField("bgColorPicker", "bgColorHex");

  function setupOptionGroup(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll(".option-card").forEach((card) => {
      card.addEventListener("click", () => {
        group.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        updatePreview();
        checkDesignDirty();  
      });
    });
  }

  setupOptionGroup("dotStyleGroup");
  setupOptionGroup("frameShapeGroup");

  updatePreview();
  saveDesignBtn.disabled = true;   

  saveDesignBtn.addEventListener("click", async () => {
    const qrId = saveDesignBtn.dataset.qrid;
    saveDesignBtn.disabled = true;
    saveDesignBtn.textContent = "Saving...";

    try {
      const res = await fetch(`/qr/${qrId}/design`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({design: getDesign()}),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      window.location.href = `/qr?focus=${qrId}`;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update design.", "error");
      saveDesignBtn.disabled = false;
      saveDesignBtn.textContent = "Apply Design Changes";
    }
  });
}

// ---------------- POLL FOR PENDING QR AFTER DESIGN SAVE / FOCUS REDIRECT ----------------
(function pollFocusedQRIfPending() {
  const params = new URLSearchParams(window.location.search);
  const focusId = params.get("focus");
  if (!focusId) return;

  const card = document.querySelector(`.qr-card[data-qrid="${focusId}"]`);
  if (!card) return;

  const pendingEl = card.querySelector(".qr-thumb .pending");
  if (!pendingEl) return;

  pollQRStatus(
    focusId,
    () => window.location.reload(),
    () => { pendingEl.innerHTML = `<i class="ri-error-warning-line"></i><br />Failed`; }
  );
})();