import { openModal } from "/js/modal.js";

document.addEventListener("DOMContentLoaded", function () {
  const triggerBtn = document.getElementById("filterTriggerBtn");
  const filterModal = document.getElementById("filterModal");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!triggerBtn || !filterModal || !searchInput || !clearBtn) return;

  triggerBtn.addEventListener("click", () => {
    openModal(filterModal);
  });

  searchInput.addEventListener("input", () => {
    clearBtn.classList.toggle("is-hidden", !searchInput.value);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("is-hidden");
    searchInput.form.submit();
  });
});