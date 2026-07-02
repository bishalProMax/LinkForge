// ---------------- CLOSE MODAL ----------------

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 200);
}

// ---------------- OPEN MODAL ----------------

function openModal(modal) {
  if (!modal) return;

  modal.style.display = "flex";

  requestAnimationFrame(() => {
    modal.classList.add("show");
  });
}

// ---------------- CLOSE BUTTONS ----------------

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".qr-modal, .delete-modal");

    closeModal(modal);
  });
});

// ---------------- OUTSIDE CLICK ----------------

window.addEventListener("click", (e) => {
  const openedModal = document.querySelector(
    ".qr-modal.show, .delete-modal.show"
  );

  if (!openedModal) {
    return;
  }

  const modalContent = openedModal.querySelector(
    ".qr-content, .delete-content"
  );

  if (!modalContent.contains(e.target)) {
    closeModal(openedModal);
  }
});

// ---------------- ESC ----------------

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") {
    return;
  }

  document
    .querySelectorAll(".qr-modal.show, .delete-modal.show")
    .forEach(closeModal);
});

export { openModal, closeModal };