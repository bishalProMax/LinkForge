document.querySelectorAll(".analytics-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const shortId = button.dataset.shortid;
    if (!shortId) return;
    window.location.href = `/analytics?type=url&id=${encodeURIComponent(shortId)}`;
  });
});

document.querySelectorAll(".qr-analytics-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const qrId = button.dataset.qrid;
    if (!qrId) return;
    window.location.href = `/analytics?type=qr&id=${encodeURIComponent(qrId)}`;
  });
});