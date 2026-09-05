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

  aiBtn.addEventListener("click", () => sidebar.classList.add("open"));
  closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));

  function appendMessage(role, content) {
    const el = document.createElement("div");
    el.className = `ai-message ${role}`;
    el.textContent = content;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
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