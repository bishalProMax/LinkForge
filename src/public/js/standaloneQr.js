import { openModal } from "./modal.js";
import { showToast } from "./toast.js";
import { shareQRImage } from "./share.js";
import { pollQRStatus } from "./qrPolling.js";

const form = document.getElementById("standaloneQrForm");

if (form) {
  const modal = document.getElementById("standaloneQrModal");
  const loader = document.getElementById("standaloneQrLoader");
  const image = document.getElementById("standaloneQrImage");
  const destinationRow = document.getElementById("standaloneQrDestinationRow");
  const destinationEl = document.getElementById("standaloneQrDestination");
  const shareBtn = document.getElementById("shareStandaloneQR");
  const generateBtn = document.getElementById("generateQrBtn");

  // ---------------- DESIGN TOGGLE ----------------
  const toggleDesignBtn = document.getElementById("toggleDesignBtn");
  const designSection = document.getElementById("standaloneDesignSection");

  toggleDesignBtn?.addEventListener("click", () => {
    const isHidden = designSection.style.display === "none";
    designSection.style.display = isHidden ? "block" : "none";
    toggleDesignBtn.innerHTML = isHidden ? '<i class="ri-palette-line"></i> Hide Design Options' : '<i class="ri-palette-line"></i> Customize Design (Optional)';
  });

  function setupColorField(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;

    picker.addEventListener("input", () => {
      hex.value = picker.value;
    });
    hex.addEventListener("input", () => {
      let value = hex.value.trim();
      if (!value.startsWith("#")) value = `#${value}`;
      if (/^#[0-9a-fA-F]{6}$/.test(value)) picker.value = value;
    });
  }
  setupColorField("sqFgColorPicker", "sqFgColorHex");
  setupColorField("sqBgColorPicker", "sqBgColorHex");

  function setupOptionGroup(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll(".option-card").forEach((card) => {
      card.addEventListener("click", () => {
        group.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      });
    });
  }
  setupOptionGroup("sqDotStyleGroup");
  setupOptionGroup("sqFrameShapeGroup");

  function getDesign() {
    if (designSection.style.display === "none") return undefined;

    return {
      fgColor: document.getElementById("sqFgColorHex").value,
      bgColor: document.getElementById("sqBgColorHex").value,
      dotStyle: document.getElementById("sqDotStyleGroup").querySelector(".selected")?.dataset.value || "square",
      frameShape: document.getElementById("sqFrameShapeGroup").querySelector(".selected")?.dataset.value || "sharp",
    };
  }

  // ---------------- CREATE + POLL ----------------
  function reveal(imageUrl, destination) {
    image.onload = () => {
      document.getElementById("standaloneQrLoadingState").style.display = "none";
      image.style.display = "block";
      destinationEl.textContent = destination;
      destinationRow.style.display = "flex";
      shareBtn.style.display = "flex";
      shareBtn.dataset.imageUrl = imageUrl;
      shareBtn.dataset.destination = destination;
    };
    image.src = imageUrl;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const destinationURL = document.getElementById("qrDestinationUrl").value.trim();
    const title = document.getElementById("qrTitle").value.trim();
    const expiration = document.getElementById("expiration").value;
    const customExpiry = document.getElementById("customExpiry").value;

    if (!destinationURL) return;

    generateBtn.disabled = true;

    try {
      const res = await fetch("/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationURL,
          title,
          expiration,
          customExpiry: customExpiry || undefined,
          design: getDesign(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      image.style.display = "none";
      destinationRow.style.display = "none";
      shareBtn.style.display = "none";
      loader.innerHTML = "<span></span><span></span><span></span>";
      document.getElementById("standaloneQrLoadingState").style.display = "flex";

      openModal(modal);
      pollQRStatus(
        data.qrId,
        (imageUrl) => reveal(imageUrl, destinationURL),
        () => {
          loader.textContent = "QR generation failed. Please try again.";
        }
      );

      form.reset();
      document.getElementById("customDateWrapper").style.display = "none";
      designSection.style.display = "none";
      toggleDesignBtn.innerHTML = '<i class="ri-palette-line"></i> Customize Design (Optional)';
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to generate QR code.", "error");
    } finally {
      generateBtn.disabled = false;
    }
  });

  shareBtn?.addEventListener("click", () => {
    const imageUrl = shareBtn.dataset.imageUrl;
    const destination = shareBtn.dataset.destination;
    if (imageUrl) shareQRImage(imageUrl, destination);
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      const isCloseTrigger = e.target.closest("[data-close-modal]") || e.target === modal;
      if (isCloseTrigger) window.location.reload();
    });
  }
}