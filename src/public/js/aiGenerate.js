import { showToast } from "./toast.js";

document.querySelectorAll(".ai-generate-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const mode = btn.dataset.mode;
    const sourceInput = document.getElementById(btn.dataset.source);
    const targetInput = document.getElementById(btn.dataset.target);

    if (!sourceInput || !sourceInput.value.trim()) {
      showToast("Enter a destination URL first.");
      return;
    }

    btn.disabled = true;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = "Generating…";

    try {
      const res = await fetch(`/ai/generate/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceInput.value.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.suggestions && data.suggestions.length > 0) {
        targetInput.value = data.suggestions[0];
        targetInput.dispatchEvent(new Event("input"));
      } else {
        showToast("No suggestions available right now.");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to generate a suggestion.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  });
});
