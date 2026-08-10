document.querySelectorAll(".show-qr-tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const qrId = button.dataset.qrid;
    if (!qrId) return;
    window.location.href = `/qr?focus=${encodeURIComponent(qrId)}`;
  });
});