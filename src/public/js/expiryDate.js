const expiration = document.getElementById("expiration");
const customWrapper = document.getElementById("customDateWrapper");

if (expiration && customWrapper) {
  expiration.addEventListener("change", () => {
    if (expiration.value === "custom") {
      customWrapper.style.display = "block";
    } else {
      customWrapper.style.display = "none";
    }
  });
}

