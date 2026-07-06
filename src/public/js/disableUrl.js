const buttons = document.querySelectorAll(".disable-btn");

  buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const shortId = button.dataset.shortid;

    if (!shortId) {
      return;
    }

    button.disabled = true;

    try {
      const response = await fetch(`/url/${shortId}/disable`, {
        method: "PATCH",
      });

      const result = await response.json(); 
      if (!response.ok) {
        throw new Error(result.message);
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to update link status.");
      button.disabled = false;
    }
  });
});