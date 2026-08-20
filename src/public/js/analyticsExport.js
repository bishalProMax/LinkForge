import { showToast } from "./toast.js";

// ---------------- DROPDOWN TOGGLE ----------------

document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".chart-download-trigger");

  if (trigger) {
    e.stopPropagation();
    const menu = trigger.closest(".chart-download-wrap").querySelector(".chart-download-menu");
    document.querySelectorAll(".chart-download-menu.open").forEach((m) => {
      if (m !== menu) m.classList.remove("open");
    });
    menu.classList.toggle("open");
    return;
  }

  document.querySelectorAll(".chart-download-menu.open").forEach((m) => m.classList.remove("open"));
});

// ---------------- IMAGE EXPORT (client-side, no server round trip) ----------------

function exportChartAsImage(chartInstance, format, filename) {
  const mime = format === "jpeg" ? "image/jpeg" : "image/png";
  const dataUrl = chartInstance.toBase64Image(mime, 1.0);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}.${format}`;
  link.click();
}

// ---------------- PDF EXPORT (sends the exported PNG to the server) ----------------

async function exportChartAsPdf(chartInstance, filename) {
  const dataUrl = chartInstance.toBase64Image("image/png", 1.0);

  try {
    const res = await fetch("/analytics/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: dataUrl, filename }),
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch {
    showToast("Unable to export as PDF right now.");
  }
}

// ---------------- CSV EXPORT (server streams it, scoped to current view) ----------------

function exportMetricAsCsv(metric) {
  const params = window.__analyticsCurrentParams;
  if (!params) return;

  const query = new URLSearchParams(params).toString();
  window.location.href = `/analytics/export/csv/${metric}?${query}`;
}

// ---------------- WIRE UP EACH OPTION CLICK ----------------

document.addEventListener("click", (e) => {
  const option = e.target.closest(".chart-download-option");
  if (!option) return;

  const card = option.closest(".chart-card");
  const metric = card?.dataset.metric;
  const chosenFormat = option.dataset.format;
  const filename = `${metric}-analytics`;

  if (chosenFormat === "csv") {
    exportMetricAsCsv(metric);
    return;
  }

  const canvasEl = card?.querySelector("canvas");
  if (!canvasEl || !window.Chart) return;

  const chartInstance = window.Chart.getChart(canvasEl);
  if (!chartInstance) return;

  if (chosenFormat === "png" || chosenFormat === "jpeg") {
    exportChartAsImage(chartInstance, chosenFormat, filename);
  } else if (chosenFormat === "pdf") {
    exportChartAsPdf(chartInstance, filename);
  }
});