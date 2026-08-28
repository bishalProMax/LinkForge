import { openModal, closeModal } from "./modal.js";

import { showToast } from "./toast.js";

// Guard: only runs on pages that actually have the bulk-action UI (dashboard, QR dashboard).

const bulkActionBar = document.getElementById("bulkActionBar");

if (bulkActionBar) {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  const selectedCountEl = document.getElementById("bulkSelectedCount");

  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");

  // Detect which page this is by which endpoint/param name applies.

  const isQrPage = document.querySelector(".qr-card-checkbox") !== null;

  const endpoint = isQrPage ? "/qr/bulk-delete" : "/url/bulk-delete";

  const bodyKey = isQrPage ? "qrIds" : "shortIds";

  const itemName = isQrPage ? "QR code" : "link";

  const itemNamePlural = isQrPage ? "QR codes" : "links";

  const getCheckboxes = () =>
    Array.from(document.querySelectorAll(".row-select-checkbox"));

  const updateBar = () => {
  const selected = getCheckboxes().filter((cb) => cb.checked);
  const count = selected.length;
  const total = getCheckboxes().length;

  selectedCountEl.textContent = `${count} selected`;

  bulkActionBar.style.display = count > 0 ? "flex" : "none";

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = count > 0 && count === total;
  }

  // Change between Select all / Deselect all.
  const selectAllLabel = document.getElementById("selectAllLabel");

  if (selectAllLabel) {
    selectAllLabel.textContent =
      count > 0 && count === total ? "Deselect all" : "Select all";
  }

  if (bulkDeleteBtn) {
    bulkDeleteBtn.textContent = `Delete selected (${count})`;
  }
};

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-select-checkbox")) {
      updateBar();
    }
  });

  selectAllCheckbox?.addEventListener("change", () => {
  getCheckboxes().forEach(
    (cb) => (cb.checked = selectAllCheckbox.checked)
  );

  updateBar();
});

  const bulkDeleteModal = document.getElementById("bulkDeleteModal");

  const confirmBulkDeleteBtn = document.getElementById(
    "confirmBulkDeleteBtn"
  );

  const cancelBulkDeleteBtn = document.getElementById(
    "cancelBulkDeleteBtn"
  );

  const bulkDeleteMessage = document.getElementById("bulkDeleteMessage");

  bulkDeleteBtn?.addEventListener("click", () => {
    const selectedCheckboxes = getCheckboxes().filter(
      (cb) => cb.checked
    );

    const count = selectedCheckboxes.length;

    if (!count) return;

    // ADDED: Count linked QR codes among the selected items.
    // This only applies to the QR page.
    let linkedCount = 0;

    if (isQrPage) {
      linkedCount = selectedCheckboxes.filter((cb) => {
        const card = cb.closest(".qr-card");

        return card?.querySelector(".qr-badge.linked") !== null;
      }).length;
    }

    // ADDED: Make the modal title specific to the page and selected count.

    const modalTitle = bulkDeleteModal?.querySelector("h1, h2, h3");

    if (modalTitle) {
      modalTitle.textContent = `Delete ${count} ${
        count === 1 ? itemName : itemNamePlural
      }?`;
    }

    // CHANGED: Show a linked QR warning only when selected QR codes
    // actually contain linked QR codes.

    if (bulkDeleteMessage) {
      if (isQrPage && linkedCount > 0) {
        bulkDeleteMessage.textContent =
          `Are you sure you want to delete these ${count} QR codes? ` +
          `${linkedCount} of the selected QR codes are linked to short links, ` +
          `which may also be deleted. This action cannot be undone.`;
      } else {
        bulkDeleteMessage.textContent =
          `Are you sure you want to delete these ${count} ${
            count === 1 ? itemName : itemNamePlural
          }? This action cannot be undone.`;
      }
    }

    // ADDED: Make the confirmation button specific to the selected count.

    if (confirmBulkDeleteBtn) {
      confirmBulkDeleteBtn.textContent = `Delete ${count} ${
        count === 1 ? itemName : itemNamePlural
      }`;
    }

    openModal(bulkDeleteModal);
  });

  cancelBulkDeleteBtn?.addEventListener("click", () =>
    closeModal(bulkDeleteModal)
  );

  confirmBulkDeleteBtn?.addEventListener("click", async () => {
    const ids = getCheckboxes()
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.shortid);

    if (!ids.length) return;

    confirmBulkDeleteBtn.disabled = true;

    confirmBulkDeleteBtn.textContent = "Deleting...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          [bodyKey]: ids,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bulk delete failed.");
      }

      if (result.failed.length > 0) {
        showToast(
          `${result.succeeded.length} deleted, ${result.failed.length} failed.`,
          "error"
        );
      }

      window.location.reload();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to complete bulk delete."
      );

      confirmBulkDeleteBtn.disabled = false;

      // CHANGED: Restore the count-specific delete text after an error.

      const count = getCheckboxes().filter((cb) => cb.checked).length;

      confirmBulkDeleteBtn.textContent = `Delete ${count} ${
        count === 1 ? itemName : itemNamePlural
      }`;
    }
  });
}