/* global QRCode */
// ---------------- PASSWORD TOGGLE ----------------
function togglePassword(id, btn) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";

    btn.textContent = "Hide";
  } else {
    input.type = "password";

    btn.textContent = "Show";
  }
}

// ---------------- LOGIN PASSWORD TOGGLE ----------------
const togglePasswordBtn = document.getElementById("toggleLoginPassword");

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", function () {
    togglePassword("loginPassword", togglePasswordBtn);
  });
}

// ---------------- SIGNUP PASSWORD TOGGLE ----------------
const toggleSignupPassword = document.getElementById("toggleSignupPassword");

if (toggleSignupPassword) {
  toggleSignupPassword.addEventListener("click", function () {
    togglePassword("signupPassword", toggleSignupPassword);
  });
}

// ---------------- CREATE ACCOUNT REDIRECT ----------------
const createAccountBtn = document.getElementById("createAccountBtn");

if (createAccountBtn) {
  createAccountBtn.addEventListener("click", () => {
    window.location.href = "/signup";
  });
}

// ---------------- COPY TO CLIPBOARD ----------------
async function copyToClipboard(btn) {
  const shortId = btn.dataset.id;

  if (!shortId) return;

  const fullUrl = window.location.origin + "/url/" + shortId;

  try {
    await navigator.clipboard.writeText(fullUrl);
    btn.classList.add("copied");
    const icon = btn.querySelector("i");
    if (!icon) return;

    icon.classList.replace("ri-file-copy-line", "ri-check-line");

    setTimeout(() => {
      btn.classList.remove("copied");
      icon.classList.replace("ri-check-line", "ri-file-copy-line");
    }, 1500);
  } catch {
    alert("Failed to copy");
  }
}

// ---------------- COPY BUTTON EVENTS ----------------
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    copyToClipboard(this);
  });
});

// ---------------- CURRENT QR DATA ----------------
let currentQRUrl = "";
let currentQRId = "";

// ---------------- QR MODAL ----------------
function showQR(btn) {
  const loader = document.getElementById("qrLoader");
  const shortId = btn.dataset.id;
  const modal = document.getElementById("qrModal");
  const canvas = document.getElementById("qrCanvas");
  const fullUrl = window.location.origin + "/url/" + shortId;

  // STORE CURRENT QR DATA
  currentQRUrl = fullUrl;
  currentQRId = shortId;
  modal.style.display = "flex";

  setTimeout(() => {
    modal.classList.add("show");
  }, 10);

  // RESET UI
  loader.style.display = "flex";
  canvas.classList.remove("show");

  // GENERATE QR
  QRCode.toCanvas(canvas, fullUrl, function (error) {
      if (error) {
        console.error(error);
      }

      setTimeout(() => {
        loader.style.display = "none";
        canvas.classList.add("show");
      }, 250);
    }
  );
}

// ---------------- QR BUTTON EVENTS ----------------
document.querySelectorAll(".qr-btn").forEach((btn) => {
    btn.addEventListener( "click", function () {
        showQR(this);
      }
    );
  });

// ---------------- DOWNLOAD EVENT ----------------
const downloadBtn = document.getElementById("downloadQR");

if (downloadBtn) {
  downloadBtn.addEventListener("click", function () {
      const canvas = document.getElementById("qrCanvas");
      const link = document.createElement("a");
      link.download = currentQRId + ".png";
      link.href = canvas.toDataURL();
      link.click();
    }
  );
}

// ---------------- SHARE EVENT ----------------
const shareBtn = document.getElementById("shareQR");

if (shareBtn) {
  shareBtn.addEventListener("click", async function () {
      const canvas = document.getElementById("qrCanvas");

      try {
        canvas.toBlob(async function (blob) {
            if (!blob) {
              return;
            }

            const file = new File([blob], currentQRId + ".png",{ type: "image/png"});

            if (navigator.canShare && navigator.canShare({files: [file]})) {
              await navigator.share({files: [file], title: "QR Code", text: "Scan this QR"});
            } 
            else if (navigator.share) {
              await navigator.share({title: "Short URL", text: "Here is the link", url: currentQRUrl});
            } 
            else {
              await navigator.clipboard.writeText(currentQRUrl);
              alert("Link copied to clipboard");
            }
          },
          
          "image/png"
        );
      } catch (err) {
        console.log("Share failed", err);
      }
    }
  );
}

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
