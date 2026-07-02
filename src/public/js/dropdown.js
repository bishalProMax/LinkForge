// ---------------- ACTION DROPDOWN ----------------

const dropdowns = document.querySelectorAll(".action-dropdown");

// ---------------- CLOSE ALL ----------------

function closeAllDropdowns() {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

// ---------------- TOGGLE ----------------

dropdowns.forEach((dropdown) => {
  const button = dropdown.querySelector(".action-btn");

  if (!button) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = dropdown.classList.contains("open");

    closeAllDropdowns();

    if (!isOpen) {
      dropdown.classList.add("open");
    }
  });
});

// ---------------- MENU CLICK ----------------

document.querySelectorAll(".action-menu").forEach((menu) => {
  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

// ---------------- OUTSIDE CLICK ----------------

document.addEventListener("click", () => {
  closeAllDropdowns();
});

// ---------------- ESC ----------------

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllDropdowns();
  }
});