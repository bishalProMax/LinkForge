import { openModal } from "./modal.js";

// ---------------- HELPERS ----------------

function showToast(message, isSuccess) {
  const toast = document.getElementById("profileToast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `profile-toast ${isSuccess ? "success" : "error"}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

async function sendJSON(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

// ---------------- PASSWORD TOGGLE ----------------

document.querySelectorAll(".profile-toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "Hide";
    } else {
      input.type = "password";
      btn.textContent = "Show";
    }
  });
});

// ---------------- USERNAME ----------------

const saveUsernameBtn = document.getElementById("saveUsernameBtn");

saveUsernameBtn?.addEventListener("click", async () => {
  const input = document.getElementById("usernameInput");
  const errorEl = document.getElementById("usernameError");
  if (!input) return;

  errorEl.textContent = "";
  saveUsernameBtn.disabled = true;

  const { ok, data } = await sendJSON("PATCH", "/user/profile/username", { name: input.value.trim() });

  saveUsernameBtn.disabled = false;

  if (!ok) {
    errorEl.textContent = data.message || "Unable to update username.";
    return;
  }

  showToast("Username updated successfully.", true);
});

// ---------------- PASSWORD ----------------

const savePasswordBtn = document.getElementById("savePasswordBtn");

savePasswordBtn?.addEventListener("click", async () => {
  const oldPasswordInput = document.getElementById("oldPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmNewPasswordInput = document.getElementById("confirmNewPasswordInput");
  const errorEl = document.getElementById("passwordError");

  if (!newPasswordInput || !confirmNewPasswordInput) return;

  errorEl.textContent = "";
  savePasswordBtn.disabled = true;

  const { ok, data } = await sendJSON("PATCH", "/user/profile/password", {
    oldPassword: oldPasswordInput ? oldPasswordInput.value : undefined,
    newPassword: newPasswordInput.value,
    confirmNewPassword: confirmNewPasswordInput.value,
  });

  savePasswordBtn.disabled = false;

  if (!ok) {
    errorEl.textContent = data.message || "Unable to update password.";
    return;
  }

  if (oldPasswordInput) oldPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmNewPasswordInput.value = "";

  showToast("Password updated. Other devices have been signed out.", true);
});

// ---------------- DETAILS ----------------

const saveDetailsBtn = document.getElementById("saveDetailsBtn");

saveDetailsBtn?.addEventListener("click", async () => {
  const organizationInput = document.getElementById("organizationInput");
  const designationInput = document.getElementById("designationInput");
  const errorEl = document.getElementById("detailsError");

  if (!organizationInput || !designationInput) return;

  errorEl.textContent = "";
  saveDetailsBtn.disabled = true;

  const { ok, data } = await sendJSON("PATCH", "/user/profile/details", {
    organization: organizationInput.value.trim(),
    designation: designationInput.value.trim(),
  });

  saveDetailsBtn.disabled = false;

  if (!ok) {
    errorEl.textContent = data.message || "Unable to update details.";
    return;
  }

  showToast("Details updated successfully.", true);
});

// ---------------- DELETE ACCOUNT ----------------

const openDeleteAccountBtn = document.getElementById("openDeleteAccountBtn");
const deleteAccountModal = document.getElementById("deleteAccountModal");
const deleteAccountConfirmInput = document.getElementById("deleteAccountConfirmInput");
const confirmDeleteAccountBtn = document.getElementById("confirmDeleteAccountBtn");

openDeleteAccountBtn?.addEventListener("click", () => {
  openModal(deleteAccountModal);
});

deleteAccountConfirmInput?.addEventListener("input", () => {
  confirmDeleteAccountBtn.disabled = deleteAccountConfirmInput.value !== "CONFIRM DELETE";
});

confirmDeleteAccountBtn?.addEventListener("click", async () => {
  confirmDeleteAccountBtn.disabled = true;
  confirmDeleteAccountBtn.textContent = "Deleting...";

  const { ok, data } = await sendJSON("DELETE", "/user/profile/delete-account", { confirmText: deleteAccountConfirmInput.value });

  confirmDeleteAccountBtn.textContent = "Delete Account";

  if (!ok) {
    alert(data.message || "Account deletion is not available yet.");
    confirmDeleteAccountBtn.disabled = deleteAccountConfirmInput.value !== "CONFIRM DELETE";
    return;
  }

  window.location.href = "/";
});
