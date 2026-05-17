// ---------------- CLOSE MODAL ----------------
function closeQR() {
  const modal = document.getElementById("qrModal");
  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 200);
}

// ---------------- CLOSE BUTTON EVENT ----------------
const closeQRBtn = document.getElementById("closeQRBtn");
if (closeQRBtn) {
  closeQRBtn.addEventListener("click", closeQR);
}

// ---------------- CLOSE ON OUTSIDE CLICK ----------------
window.addEventListener("click", function (e) {
  const modal = document.getElementById("qrModal");
  const content = document.querySelector(".qr-content");

  if (!modal || !content) {
    return;
  }

  if (modal.style.display === "flex") {
    if (e.target.closest("button")) {
      return;
    }

    if (!content.contains(e.target)) {
      closeQR();
    }
  }
});

// ---------------- ESC KEY CLOSE ----------------
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeQR();
  }
});
