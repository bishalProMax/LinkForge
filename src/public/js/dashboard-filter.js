import { openModal } from "/js/modal.js";

document.addEventListener("DOMContentLoaded", function () {
  const triggerBtn = document.getElementById("filterTriggerBtn");
  const filterModal = document.getElementById("filterModal");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
  const urlToolbarForm = document.getElementById("urlToolbarForm");
  const statusSelect = document.getElementById("statusSelect");
  const expiryRadios = document.querySelectorAll('input[name="expiry"]');

  if (!triggerBtn || !filterModal || !searchInput || !clearBtn || !clearAllFiltersBtn || !urlToolbarForm) return;

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

  function syncExpiryWithStatus() {
    if (!statusSelect) return;

    const isExpiredStatus = statusSelect.value === "expired";

    expiryRadios.forEach((radio) => {
      radio.disabled = isExpiredStatus;
      if (isExpiredStatus) {
        radio.checked = radio.value === "all";
      }
    });
  }

  statusSelect?.addEventListener("change", () => {
    syncExpiryWithStatus();
  });

clearAllFiltersBtn?.addEventListener("click", () => {
    window.location.href = "/dashboard";
  });
});


//removes the query parameters from the URL when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href);

  if (url.searchParams.has("id") || url.searchParams.has("error")) {
    url.searchParams.delete("id");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }

  const generatedBanner = document.querySelector(".generated");

  if (generatedBanner) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "generated-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => {
      generatedBanner.remove();
    });

    generatedBanner.appendChild(closeBtn);
  }

  const errorBanner = document.querySelector(".error");

  if (errorBanner) {
    errorBanner.style.position = "relative";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "generated-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => {
      errorBanner.remove();
    });

    errorBanner.appendChild(closeBtn);
  }
});
