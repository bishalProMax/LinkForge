// ---------------- PASSWORD TOGGLE ----------------
function togglePassword(id, btn) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    btn.innerText = "Hide";
  } else {
    input.type = "password";
    btn.innerText = "Show";
  }
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

// ---------------- QR MODAL ----------------
function showQR(btn) {
  const loader = document.getElementById("qrLoader");
  const shortId = btn.dataset.id;

  const modal = document.getElementById("qrModal");
  const canvas = document.getElementById("qrCanvas");
  const download = document.getElementById("downloadQR");
  const shareBtn = document.getElementById("shareQR");

  const fullUrl = window.location.origin + "/url/" + shortId;

  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);

  // reset UI
  loader.style.display = "flex";
  canvas.classList.remove("show");

  // Generate QR
  QRCode.toCanvas(canvas, fullUrl, function (error) {
    if (error) console.error(error);

    setTimeout(() => {
      loader.style.display = "none";
      canvas.classList.add("show");
    }, 250);
  });

  // Download
  download.onclick = function () {
    const link = document.createElement("a");
    link.download = shortId + ".png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // SHARE BUTTON LOGIC
  shareBtn.onclick = async function () {
    const dataUrl = canvas.toDataURL();

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const file = new File([blob], shortId + ".png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "QR Code",
          text: "Scan this QR",
        });
      } else {
        await navigator.share({
          title: "Short URL",
          text: "Here is the link",
          url: fullUrl,
        });
      }
    } catch (err) {
      console.log("Share failed", err);
    }
  };
}

// ---------------- CLOSE MODAL ----------------
function closeQR() {
  const modal = document.getElementById("qrModal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 200);
}

// ---------------- CLOSE ON OUTSIDE CLICK ----------------
window.addEventListener("click", function (e) {
  const modal = document.getElementById("qrModal");
  const content = document.querySelector(".qr-content");

  if (modal.style.display === "flex") {
    if (e.target.closest("button")) return;

    if (!content.contains(e.target)) {
      modal.style.display = "none";
    }
  }
});

// ---------------- ESC KEY CLOSE ----------------
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("qrModal").style.display = "none";
  }
});
