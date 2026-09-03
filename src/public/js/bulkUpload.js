import { openModal } from "./modal.js";
import { showToast } from "./toast.js";

const openBtn = document.getElementById("openBulkUploadBtn");

if (openBtn) {
  const modal = document.getElementById("bulkUploadModal");
  const fileSection = document.getElementById("bulkFileSection");
  const pasteSection = document.getElementById("bulkPasteSection");
  const fileInput = document.getElementById("bulkFileInput");
  const pasteInput = document.getElementById("bulkPasteInput");
  const startBtn = document.getElementById("startBulkUploadBtn");
  const progressSection = document.getElementById("bulkProgressSection");
  const progressText = document.getElementById("bulkProgressText");
  const progressFill = document.getElementById("bulkProgressFill");
  const resultsDownload = document.getElementById("bulkResultsDownload");

  const isQrPage = document.body.dataset.bulkType === "qr";
  const uploadEndpoint = isQrPage ? "/bulk/qr" : "/bulk/links";

  let mode = "file";

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modal);
  });

  document.querySelectorAll(".bulk-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll(".bulk-tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      fileSection.style.display = mode === "file" ? "block" : "none";
      pasteSection.style.display = mode === "paste" ? "block" : "none";
    });
  });

  async function pollStatus(operationId) {
    const res = await fetch(`/bulk/${operationId}/status`);
    const data = await res.json();

    progressText.textContent = `${data.processedRows} / ${data.totalRows} processed`;
    progressFill.style.width = `${(data.processedRows / data.totalRows) * 100}%`;

    if (data.status === "COMPLETED") {
      resultsDownload.href = `/bulk/${operationId}/export`;
      resultsDownload.style.display = "inline-flex";
      startBtn.disabled = false;
      startBtn.textContent = "Start Upload";
      return;
    }

    setTimeout(() => pollStatus(operationId), 1000);
  }

  startBtn.addEventListener("click", async () => {
    let body;
    let headers = {};

    if (mode === "file") {
      if (!fileInput.files[0]) return showToast("Choose a CSV file first.");
      body = new FormData();
      body.append("file", fileInput.files[0]);
    } else {
      if (!pasteInput.value.trim()) return showToast("Paste at least one URL first.");
      body = JSON.stringify({ text: pasteInput.value });
      headers = { "Content-Type": "application/json" };
    }

    startBtn.disabled = true;
    startBtn.textContent = "Uploading...";
    progressSection.style.display = "block";
    resultsDownload.style.display = "none";

    try {
      const res = await fetch(uploadEndpoint, { method: "POST", headers, body });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      pollStatus(data.operationId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to start bulk upload.");
      startBtn.disabled = false;
      startBtn.textContent = "Start Upload";
    }
  });
}
