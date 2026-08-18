function watchDirty(fields, saveBtn) {
  fields = fields.filter(Boolean);
  if (!fields.length || !saveBtn) return;

  const initial = new Map(fields.map((f) => [f, f.value]));

  const check = () => {
    const isDirty = fields.some((f) => f.value !== initial.get(f));
    saveBtn.disabled = !isDirty;
  };

  fields.forEach((f) => {
    f.addEventListener("input", check);
    f.addEventListener("change", check);
  });

  saveBtn.disabled = true;
}

export { watchDirty };