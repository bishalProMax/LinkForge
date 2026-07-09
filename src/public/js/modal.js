// ---------------- CLOSE MODAL ----------------

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 200);

  if (!document.querySelector(".modal.show")) {
    document.body.classList.remove("modal-open");
  }
}

// ---------------- OPEN MODAL ----------------

function openModal(modal) {
  if (!modal) return;

  modal.style.display = "flex";

  requestAnimationFrame(() => {
    modal.classList.add("show");
  });

  document.body.classList.add("modal-open");
}

// ---------------- CLOSE BUTTONS ----------------

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");

    closeModal(modal);
  });
});

// ---------------- OUTSIDE CLICK ----------------

window.addEventListener("click", (e) => {
  const openedModal = document.querySelector(".modal.show");

  if (!openedModal) {
    return;
  }

  const modalContent = openedModal.querySelector(".modal-content");

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
    .querySelectorAll(".modal.show")
    .forEach(closeModal);
});

export { openModal, closeModal };