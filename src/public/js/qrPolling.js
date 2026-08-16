const MIN_LOADER_MS = 500;

async function pollQRStatus(qrId, onReady, onFailed, attempt = 0, startedAt = Date.now()) {
  const res = await fetch(`/qr/${qrId}/status`);
  const data = await res.json();

  if (data.status === "READY") {
    const elapsed = Date.now() - startedAt;
    setTimeout(() => onReady(data.imageUrl), Math.max(0, MIN_LOADER_MS - elapsed));
    return;
  }

  if (data.status === "FAILED") {
    onFailed();
    return;
  }

  const delays = [300, 600, 1000, 1500];
  setTimeout(() => pollQRStatus(qrId, onReady, onFailed, attempt + 1, startedAt), delays[Math.min(attempt, delays.length - 1)]);
}

export { pollQRStatus };
