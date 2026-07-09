const expiration = document.getElementById("expiration");
const customWrapper = document.getElementById("customDateWrapper");
const customExpiryInput = document.getElementById("customExpiry");

if (expiration && customWrapper) {
  expiration.addEventListener("change", () => {
    if (expiration.value === "custom") {
      customWrapper.style.display = "block";

      if (customExpiryInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        customExpiryInput.min = now.toISOString().slice(0, 16);
        customExpiryInput.required = true;
      }
    } else {
      customWrapper.style.display = "none";

      if (customExpiryInput) {
        customExpiryInput.required = false;
        customExpiryInput.value = "";
        customExpiryInput.setCustomValidity("");
      }
    }
  });
}