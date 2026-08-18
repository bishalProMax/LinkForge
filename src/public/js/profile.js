import { openModal } from "./modal.js";
import { showToast } from "./toast.js";
import { watchDirty } from "./dirtyCheck.js";

async function sendJSON(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

// ---------------- USERNAME ----------------

const saveUsernameBtn = document.getElementById("saveUsernameBtn");

saveUsernameBtn?.addEventListener("click", async () => {
  const input = document.getElementById("usernameInput");
  const errorEl = document.getElementById("usernameError");
  if (!input) return;

  errorEl.textContent = "";
  saveUsernameBtn.disabled = true;

  const { ok, data } = await sendJSON("PATCH", "/user/profile/username", { name: input.value.trim() });

  if (!ok) {
    saveUsernameBtn.disabled = false;
    errorEl.textContent = data.message || "Unable to update username.";
    return;
  }

  showToast("Username updated successfully.", "success");
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

  if (!ok) {
    savePasswordBtn.disabled = false;
    errorEl.textContent = data.message || "Unable to update password.";
    return;
  }

  if (oldPasswordInput) oldPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmNewPasswordInput.value = "";
  savePasswordBtn.disabled = true;

  showToast("Password updated. Other devices have been signed out.", "success");
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

  if (!ok) {
    saveDetailsBtn.disabled = false;
    errorEl.textContent = data.message || "Unable to update details.";
    return;
  }

  showToast("Details updated successfully.", "success");
});

// ---------------- DIRTY-CHECK WIRING ----------------

watchDirty([document.getElementById("usernameInput")], saveUsernameBtn);
watchDirty(
  [document.getElementById("oldPasswordInput"), document.getElementById("newPasswordInput"), document.getElementById("confirmNewPasswordInput")],
  savePasswordBtn
);
watchDirty([document.getElementById("organizationInput"), document.getElementById("designationInput")], saveDetailsBtn);

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
    showToast(data.message || "Account deletion is not available yet.", "error");
    confirmDeleteAccountBtn.disabled = deleteAccountConfirmInput.value !== "CONFIRM DELETE";
    return;
  }

  window.location.href = "/";
});