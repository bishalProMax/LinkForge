//focus highlight URL->QR OR QR-> URL
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("[data-focus-id]");
  if (!container) return;

  const focusId = container.dataset.focusId;
  if (!focusId) return;

  const target =
    container.querySelector(`tr[data-shortid="${focusId}"]`) ||
    container.querySelector(`[data-qrid="${focusId}"]`);

  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.classList.add("focus-glow");

  setTimeout(() => {
    target.classList.add("focus-glow-fade");
    setTimeout(() => {target.classList.remove("focus-glow", "focus-glow-fade");
    target.blur(); 
    },1600);
  }, 2500);

  const url = new URL(window.location.href);
  url.searchParams.delete("focus");
  window.history.replaceState({}, "", url.toString());
});

//search highlight
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(el, query) {
  if (!el || !query ) return;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const original = el.textContent;

  if (!regex.test(original)) return;

  el.innerHTML = original.replace(regex, '<mark class="search-highlight">$1</mark>');
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const searchQuery = params.get("search");
  if (searchQuery) {
    document.querySelectorAll(".title-cell, .short-link, .redirect-link").forEach((el) => highlightText(el, searchQuery));
    document.querySelectorAll(".qr-title, .qr-destination a, [data-qrid-label]").forEach((el) => highlightText(el, searchQuery));
  }

  const emailQuery = params.get("email");
  const ipQuery = params.get("ip");
  if (emailQuery || ipQuery) {
    document.querySelectorAll("td").forEach((td) => {
      if (emailQuery) highlightText(td, emailQuery);
      if (ipQuery) highlightText(td, ipQuery);
    });
  }
});