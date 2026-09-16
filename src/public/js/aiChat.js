import { showToast } from "./toast.js";

const aiBtn = document.getElementById("aiAssistantBtn");

if (aiBtn) {
  const sidebar = document.getElementById("aiSidebar");
  const closeBtn = document.getElementById("aiSidebarClose");
  const messagesEl = document.getElementById("aiMessages");
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiSendBtn");
  const typingEl = document.getElementById("aiTypingIndicator");
  const attachBtn = document.getElementById("aiAttachBtn");
  const fileInput = document.getElementById("aiFileInput");

  let history = [];

  input.addEventListener("input", () => {
  if (!input.value.trim()) {
    input.style.height = "50px";
    input.style.overflowY = "hidden";
    return;
  }
  input.style.height = "auto";
  const height = Math.min(input.scrollHeight, 120);
  input.style.height = `${height}px`;
  input.style.overflowY = input.scrollHeight > 120 ? "auto" : "hidden";
});

  aiBtn.addEventListener("click", () => sidebar.classList.add("open"));
  closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));

  function appendMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `ai-message ${role}`;
    wrapper.textContent = content;
    messagesEl.appendChild(wrapper);

    if (role === "assistant") {
      const dlBtn = document.createElement("button");
      dlBtn.type = "button";
      dlBtn.className = "ai-pdf-export-btn";
      dlBtn.innerHTML = '<i class="ri-file-pdf-2-line"></i> Download as PDF';
      dlBtn.addEventListener("click", () => exportAsPdf(content));
      messagesEl.appendChild(dlBtn);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function exportAsPdf(text) {
    try {
      const res = await fetch("/ai/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: "LinkForge AI Summary" }),
      });
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "analytics-summary.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Unable to export as PDF right now.");
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    typingEl.style.display = "block";
    sendBtn.disabled = true;

    try {
      const res = await fetch("/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      appendMessage("assistant", data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "The assistant is unavailable right now.");
    } finally {
      typingEl.style.display = "none";
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  attachBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      showToast("File attachments for bulk creation are coming in a later update.", "success");
      fileInput.value = "";
    }
  });
}