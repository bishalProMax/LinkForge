import { showToast } from "./toast.js";

const typeToggleContainer = document.querySelector(".analytics-type-toggle");

// Guard: this file is bundled into every page via main.js, but only runs its logic on /analytics.
if (typeToggleContainer) {
  let activeCharts = {};

  const destroyExistingCharts = () => {
    Object.values(activeCharts).forEach((chart) => chart.destroy());
    activeCharts = {};
  };

  const renderLineChart = (canvasId, timeSeries) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    activeCharts[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: timeSeries.map((p) => p.bucket),
        datasets: [{ label: "Activity", data: timeSeries.map((p) => p.count), borderColor: "#5b6dff", backgroundColor: "rgba(91,109,255,0.1)", fill: true, tension: 0.3 }],
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
  };

  const toggleTopItemsCard = (isSingleItem) => {
    const card = document.querySelector('[data-metric="topItems"]');
    if (card) card.style.display = isSingleItem ? "none" : "";
  };

  const loadAnalytics = async (params) => {
    window.__analyticsCurrentParams = params;

    const query = new URLSearchParams(params).toString();

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

      renderLineChart("chart-timeSeries", data.timeSeries);
      if (!data.isSingleItem) renderBarChart("chart-topItems", data.topItems, "label", "count");
      renderBarChart("chart-country", data.geo.country, "label", "count");
      renderBarChart("chart-region", data.geo.region, "label", "count");
      renderBarChart("chart-city", data.geo.city, "label", "count");
      renderDonutChart("chart-browsers", data.device.browsers);
      renderDonutChart("chart-os", data.device.os);
      renderDonutChart("chart-devices", data.device.devices);
      renderReferrerTable(data.referrers);
    } catch {
      showToast("Unable to load analytics right now.");
    }
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
    loadAnalytics({ type: currentType, ...(currentId ? { id: currentId } : {}) });
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
    currentId = searchInput.value.trim();
    refresh();
  });

  clearSearchBtn?.addEventListener("click", () => {
    currentId = "";
    if (searchInput) searchInput.value = "";
    refresh();
  });

  if (currentId && searchInput) searchInput.value = currentId;

  refresh();
}