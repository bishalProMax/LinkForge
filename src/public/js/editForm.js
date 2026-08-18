import { watchDirty } from "./dirtyCheck.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editForm");
  const saveBtn = document.getElementById("saveChangesBtn");
  if (!form || !saveBtn) return;

  watchDirty(Array.from(form.querySelectorAll("input, select")), saveBtn);
});

