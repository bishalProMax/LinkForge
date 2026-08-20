const searchInput = document.getElementById("adminUserSearchInput");

// Guard: only present on the analytics page, and only for Admin/Super Admin.
if (searchInput) {
  const resultsBox = document.getElementById("adminUserSearchResults");
  const pill = document.getElementById("adminScopedUserPill");
  const pillLabel = document.getElementById("adminScopedUserLabel");
  const clearBtn = document.getElementById("clearAdminUserScope");

  let debounceTimer = null;

  const setScopedUser = (userId, label) => {
    window.__analyticsAdminUserId = userId;
    pillLabel.textContent = label;
    pill.style.display = "inline-flex";
    resultsBox.classList.remove("open");
    searchInput.value = "";
    window.dispatchEvent(new CustomEvent("analytics:admin-scope-changed", { detail: { userId } }));
  };

  const clearScopedUser = () => {
    window.__analyticsAdminUserId = null;
    pill.style.display = "none";
    window.dispatchEvent(new CustomEvent("analytics:admin-scope-changed", { detail: { userId: null } }));
  };

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (!query) {
      resultsBox.classList.remove("open");
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/admin/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        resultsBox.innerHTML = "";

        if (!data.users || data.users.length === 0) {
          resultsBox.innerHTML = `<div class="admin-user-result-item">No matching users.</div>`;
        } else {
          data.users.forEach((u) => {
            const item = document.createElement("div");
            item.className = "admin-user-result-item";
            item.innerHTML = `${u.name}<div class="result-email">${u.email}</div>`;
            item.addEventListener("click", () => setScopedUser(u._id, `${u.name} (${u.email})`));
            resultsBox.appendChild(item);
          });
        }

        resultsBox.classList.add("open");
      } catch {
        resultsBox.classList.remove("open");
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".analytics-admin-search")) {
      resultsBox.classList.remove("open");
    }
  });

  clearBtn?.addEventListener("click", clearScopedUser);
}
