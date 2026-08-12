document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editForm");
  const saveBtn = document.getElementById("saveChangesBtn");

  if (!form || !saveBtn) return;

  const fields = Array.from(form.querySelectorAll("input, select"));
  const initialValues = new Map(fields.map((f) => [f.name, f.value]));

  const checkDirty = () => {
    const isDirty = fields.some((f) => f.value !== initialValues.get(f.name));
    saveBtn.disabled = !isDirty;
  };

  fields.forEach((f) => f.addEventListener("input", checkDirty));
  fields.forEach((f) => f.addEventListener("change", checkDirty));

  saveBtn.disabled = true;
});

