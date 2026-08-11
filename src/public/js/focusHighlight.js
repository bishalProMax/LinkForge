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