// ---------------- COPY TO CLIPBOARD ----------------
async function copyToClipboard(btn) {
    if (!btn) {
    return;
  }

  const shortId = btn.dataset.id;

  if (!shortId) return;

  const fullUrl = `${window.location.origin}/url/${shortId}`;

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
