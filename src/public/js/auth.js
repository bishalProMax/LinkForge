// ---------------- PASSWORD TOGGLE ----------------
function togglePassword(id, btn) {
  const input = document.getElementById(id);
  
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";

    btn.textContent = "Hide";
  } else {
    input.type = "password";

    btn.textContent = "Show";
  }
}

// ---------------- SETUP TOGGLE EVENTS ----------------
function setupPasswordToggle(buttonId, inputId) {
  const button = document.getElementById(buttonId);

  if (!button) return;

  button.addEventListener("click", () => {
    togglePassword(inputId, button);
  });
}

setupPasswordToggle("toggleLoginPassword", "loginPassword");
setupPasswordToggle("toggleSignupPassword", "signupPassword");
setupPasswordToggle("toggleResetPassword","resetPassword");
setupPasswordToggle("toggleConfirmResetPassword","confirmResetPassword");

// ---------------- CREATE ACCOUNT REDIRECT ----------------
const createAccountBtn = document.getElementById("createAccountBtn");

if (createAccountBtn) {
  createAccountBtn.addEventListener("click", () => {
    window.location.href = "/signup";
  });
}