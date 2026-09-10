import { showToast } from "./toast.js";
import { stripBaseUrl } from "./stripBaseUrl.js";

const typeToggleContainer = document.querySelector(".analytics-type-toggle");

if (typeToggleContainer) {
  let activeCharts = {};
  let eventSource = null;
  let streamRefreshTimer = null;

  const destroyExistingCharts = () => {
    Object.values(activeCharts).forEach((chart) => chart.destroy());
    activeCharts = {};
  };

  const renderLineChart = (canvasId, timeSeries, label) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    activeCharts[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: timeSeries.map((p) => p.Date),
        datasets: [{ label, data: timeSeries.map((p) => p.count), borderColor: "#5b6dff", backgroundColor: "rgba(91,109,255,0.1)", fill: true, tension: 0.3 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
  };

  const renderBarChart = (canvasId, points, labelKey, valueKey) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    activeCharts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: points.map((p) => p[labelKey]),
        datasets: [{ label: "Count", data: points.map((p) => p[valueKey]), backgroundColor: "#5b6dff" }],
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false } } },
    });
  };

  const renderDonutChart = (canvasId, points) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const palette = ["#5b6dff", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#6366f1", "#84cc16", "#94a3b8"];

    activeCharts[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: { labels: points.map((p) => p.label), datasets: [{ data: points.map((p) => p.count), backgroundColor: palette }] },
      options: { responsive: true, maintainAspectRatio: false },
    });
  };

  const renderReferrerTable = (points) => {
    const tbody = document.getElementById("referrerTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!points.length) {
      tbody.innerHTML = `<tr><td colspan="2" class="empty-cell">No referrer data yet.</td></tr>`;
      return;
    }

    points.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${p.label}</td><td>${p.count}</td>`;
      tbody.appendChild(row);
    });
  };

  const updateStatCards = (overview) => {
    document.getElementById("statTotal").textContent = overview.stats.totalCount;
    document.getElementById("statFirst").textContent = overview.stats.firstActivity ? new Date(overview.stats.firstActivity).toLocaleDateString("en-IN") : "—";
    document.getElementById("statLast").textContent = overview.stats.lastActivity ? new Date(overview.stats.lastActivity).toLocaleDateString("en-IN") : "—";
    document.getElementById("statActive").textContent = overview.statusSummary.active;
    document.getElementById("statExpired").textContent = overview.statusSummary.expired;
    document.getElementById("statDisabled").textContent = overview.statusSummary.disabled; 
  };

  const toggleTopItemsCard = (isSingleItem) => {
    const card = document.querySelector('[data-metric="topItems"]');
    if (card) card.style.display = isSingleItem ? "none" : "";
  };

  const toggleReferrerCard = (type) => {
    const card = document.querySelector('[data-metric="referrer"]');
    if (card) card.style.display = type === "qr" ? "none" : "";
  };

  const updateTypeLabels = (type) => {
    const statLabel = document.getElementById("statTotalLabel");
    if (statLabel) statLabel.textContent = type === "qr" ? "Total Scans" : "Total Clicks";

    const chartTitle = document.querySelector('[data-metric="timeSeries"] h3');
    if (chartTitle) chartTitle.textContent = type === "qr" ? "Scans Over Time" : "Clicks Over Time";

    const searchInputEl = document.getElementById("analyticsSearchInput");
    if (searchInputEl) searchInputEl.placeholder = type === "qr" ? "Search by QR ID…" : "Search by short ID…";
  };

  const getFullParams = (baseParams) => {
    const adminUserId = window.__analyticsAdminUserId;
    return adminUserId ? { ...baseParams, userId: adminUserId } : baseParams;
  };

  const loadAnalytics = async (params) => {
    const adminUserId = window.__analyticsAdminUserId;
    const fullParams = adminUserId ? { ...params, userId: adminUserId } : params;
    window.__analyticsCurrentParams = fullParams;
    const query = new URLSearchParams(fullParams).toString();

    try {
      const res = await fetch(`/analytics/overview?${query}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Unable to load analytics.");
        return;
      }

      destroyExistingCharts();
      updateStatCards(data);
      toggleTopItemsCard(data.isSingleItem);
      toggleReferrerCard(fullParams.type);

      const renderSafely = (fn) => {
        try {
          fn();
        } catch (err) {
          console.error("Chart render failed:", err);
        }
      };

      renderSafely(() => renderLineChart("chart-timeSeries", data.timeSeries, fullParams.type === "qr" ? "Scans" : "Clicks"));
      if (!data.isSingleItem) renderSafely(() => renderBarChart("chart-topItems", data.topItems, "label", "count"));
      renderSafely(() => renderBarChart("chart-country", data.geo.country, "label", "count"));
      renderSafely(() => renderBarChart("chart-region", data.geo.region, "label", "count"));
      renderSafely(() => renderBarChart("chart-city", data.geo.city, "label", "count"));
      renderSafely(() => renderDonutChart("chart-browsers", data.device.browsers));
      renderSafely(() => renderDonutChart("chart-os", data.device.os));
      renderSafely(() => renderDonutChart("chart-devices", data.device.devices));
      if (fullParams.type !== "qr") renderSafely(() => renderReferrerTable(data.referrers));
    } catch {
      showToast("Unable to load analytics right now.");
    }
  };

  const connectStream = (params) => {
    eventSource?.close();

    const query = new URLSearchParams(params).toString();
    eventSource = new EventSource(`/analytics/stream?${query}`);

    eventSource.onmessage = () => {
      clearTimeout(streamRefreshTimer);
      streamRefreshTimer = setTimeout(() => loadAnalytics(window.__analyticsCurrentParams), 1500);
    };

    eventSource.onerror = () => {};
  };

  const typeToggleButtons = document.querySelectorAll(".analytics-type-btn");
  const searchInput = document.getElementById("analyticsSearchInput");
  const searchForm = document.getElementById("analyticsSearchForm");
  const clearSearchBtn = document.getElementById("analyticsClearSearchBtn");

  let currentType = document.body.dataset.initialType || "url";
  let currentId = document.body.dataset.initialId || "";

  const setActiveTypeButton = () => {
    typeToggleButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.type === currentType));
  };

  const refresh = () => {
    setActiveTypeButton();
    updateTypeLabels(currentType);

    const baseParams = { type: currentType, ...(currentId ? { id: currentId } : {}) };
    const fullParams = getFullParams(baseParams);

    window.__analyticsCurrentParams = fullParams;

    loadAnalytics(fullParams);
    connectStream(fullParams);

    clearSearchBtn.classList.toggle("is-hidden", !currentId);
  };

  typeToggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      currentId = "";
      if (searchInput) searchInput.value = "";
      refresh();
    });
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    currentId = stripBaseUrl(searchInput.value.trim());
    refresh();
  });

  searchInput?.addEventListener("input", () => {
    clearSearchBtn.classList.toggle("is-hidden", !searchInput.value);
    if (searchInput.value === "" && currentId !== "") {
      currentId = "";
      refresh();
    }
  });

  clearSearchBtn?.addEventListener("click", () => {
    currentId = "";
    if (searchInput) searchInput.value = "";
    refresh();
  });

  window.addEventListener("analytics:admin-scope-changed", () => refresh());

  document.getElementById("exportRawCsvBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const params = window.__analyticsCurrentParams;
    if (!params) return;
    const query = new URLSearchParams(params).toString();
    window.location.href = `/analytics/export/raw?${query}`;
  });

  window.addEventListener("beforeunload", () => eventSource?.close());

  if (currentId && searchInput) searchInput.value = currentId;

  refresh();
}
