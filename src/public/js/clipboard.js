// ---------------- COPY TO CLIPBOARD ----------------

async function copyToClipboard(button) {
  if (!button) {
    return;
  }

  const fullUrl = button.dataset.url;

  if (!fullUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(fullUrl);

    const icon = button.querySelector("i");

    if (!icon) {
      return;
    }

    button.classList.add("copied");

    icon.classList.replace(
      "ri-file-copy-line",
      "ri-check-line"
    );

    setTimeout(() => {
      button.classList.remove("copied");

      icon.classList.replace(
        "ri-check-line",
        "ri-file-copy-line"
      );
    }, 1500);

  } catch (error) {

    console.error("Failed to copy:", error);

    alert("Failed to copy the link.");
  }
}

// ---------------- COPY BUTTON EVENTS ----------------

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", () => {
    copyToClipboard(button);
  });
});