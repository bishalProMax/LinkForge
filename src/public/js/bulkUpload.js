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
  const modalHint = document.getElementById("bulkModalHint");

  const isQrPage = document.body.dataset.bulkType === "qr";
  const uploadEndpoint = isQrPage ? "/bulk/qr" : "/bulk/links";
  const sampleCsvUrl = isQrPage ? "/bulk/sample/qr.csv" : "/bulk/sample/links.csv";

  let mode = "file";
  let pollTimeoutId = null;
  let uploadCompletedThisSession = false;

  if (modalHint) {
    const aliasLine = isQrPage ? "" : "<li><strong>customalias</strong>, <strong>title</strong> — optional, auto-generated if left blank</li>";
    const titleOnlyLine = isQrPage ? "<li><strong>title</strong> — optional, auto-generated if left blank</li>" : "";
    modalHint.innerHTML = `
      <ul class="bulk-hint-list">
        <li><strong>destinationurl</strong> — required</li>
        ${aliasLine}${titleOnlyLine}
        <li><strong>expiration</strong> — never / 1d / 3d / 7d / 30d / custom (default: never)</li>
        <li><strong>customexpiry</strong> — only with expiration=custom, e.g. 31-12-2026</li>
      </ul>
      <p class="bulk-hint-footer">Or paste one destination URL per line for a quick create.
      <br>
      <a href="${sampleCsvUrl}" download>Download sample CSV</a>.</p>
    `;
  }

  function resetModal() {
    clearTimeout(pollTimeoutId);
    fileInput.value = "";
    pasteInput.value = "";
    progressSection.style.display = "none";
    progressText.textContent = "0 / 0 processed";
    progressFill.style.width = "0%";
    resultsDownload.style.display = "none";
    startBtn.style.display = "inline-flex";
    startBtn.disabled = false;
    startBtn.textContent = "Start Upload";
    mode = "file";
    fileSection.style.display = "block";
    pasteSection.style.display = "none";
    document.querySelectorAll(".bulk-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === "file"));
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetModal();
    openModal(modal);
  });

  const modalObserver = new MutationObserver(() => {
    if (!modal.classList.contains("show") && uploadCompletedThisSession) {
      uploadCompletedThisSession = false;
      window.location.reload();
    }
  });
  modalObserver.observe(modal, { attributes: true, attributeFilter: ["class"] });

  document.querySelectorAll(".bulk-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll(".bulk-tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      fileSection.style.display = mode === "file" ? "block" : "none";
      pasteSection.style.display = mode === "paste" ? "block" : "none";
    });
  });

  async function waitForQrReadiness(operationId, attempt = 0) {
    const res = await fetch(`/bulk/${operationId}/qr-readiness`);
    const data = await res.json();

    if (data.ready) {
      progressFill.style.width = "100%";
      progressText.textContent = "All QR images ready.";
      revealDownload(operationId);
      return;
    }

    if (attempt >= 20) {
      progressText.textContent = `${data.pending} QR image${data.pending === 1 ? " is" : "s are"} still generating — download now, or check back shortly if any rows look incomplete.`;
      revealDownload(operationId);
      return;
    }

    progressText.textContent = `Finalizing QR images… (${data.pending} remaining)`;
    setTimeout(() => waitForQrReadiness(operationId, attempt + 1), 1000);
  }

  function revealDownload(operationId) {
    resultsDownload.href = `/bulk/${operationId}/export`;
    resultsDownload.style.display = "inline-flex";
    startBtn.style.display = "none";
    uploadCompletedThisSession = true;
  }

  async function pollStatus(operationId) {
    const res = await fetch(`/bulk/${operationId}/status`);
    const data = await res.json();

    progressText.textContent = `${data.processedRows} / ${data.totalRows} processed`;
    progressFill.style.width = `${(data.processedRows / data.totalRows) * 100}%`;

    if (data.status === "COMPLETED") {
      if (isQrPage) {
        progressText.textContent = "Finalizing QR images…";
        waitForQrReadiness(operationId);
      } else {
        revealDownload(operationId);
      }
      return;
    }

    pollTimeoutId = setTimeout(() => pollStatus(operationId), 1000);
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
    progressFill.style.width = "0%";
    resultsDownload.style.display = "none";

    try {
      const res = await fetch(uploadEndpoint, { method: "POST", headers, body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      startBtn.textContent = "Processing...";
      pollStatus(data.operationId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to start bulk upload.");
      startBtn.disabled = false;
      startBtn.textContent = "Start Upload";
    }
  });
}