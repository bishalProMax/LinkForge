const otpBoxes = document.querySelectorAll(".otp-digit");
const otpValue = document.getElementById("otpValue");
const otpHiddenInput = document.getElementById("otpHiddenInput");

if (otpBoxes.length) {
  otpBoxes[0].focus();

  function updateOTPValue() {
    otpValue.value = [...otpBoxes].map((box) => box.value).join("");
  }

  otpBoxes.forEach((box, index) => {
    box.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, "");

      e.target.value = value;

      if (value && index < otpBoxes.length - 1) {
        otpBoxes[index + 1].focus();
      }

      updateOTPValue();
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && index > 0) {
        otpBoxes[index - 1].focus();
      }
    });

    box.addEventListener("paste", (e) => {
      e.preventDefault();

      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

      pasted.split("").forEach((digit, i) => {
        if (otpBoxes[i]) {
          otpBoxes[i].value = digit;
        }
      });

      updateOTPValue();
    });
  });

  if (otpHiddenInput) {
    otpHiddenInput.addEventListener("input", () => {
      const code = otpHiddenInput.value.replace(/\D/g, "").slice(0, 6);

      code.split("").forEach((digit, index) => {
        if (otpBoxes[index]) {
          otpBoxes[index].value = digit;
        }
      });

      updateOTPValue();
    });
  }
}

//---------------- Resend OTP Timer ----------------//
const resendSection = document.querySelector(".resend-section");
const resendBtn = document.getElementById("resendBtn");
const resendTimer = document.getElementById("resendTimer");

if (resendSection && resendBtn && resendTimer) {
  let timeLeft = Number(resendSection.dataset.cooldown) || 0;

  if (timeLeft > 0) {
    resendBtn.disabled = true;
    resendTimer.textContent = `Resend OTP in ${timeLeft}s`;
  } else {
  resendBtn.disabled = false;
}

  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendTimer.textContent = "You can now resend the OTP.";
      return;
    }
    timeLeft--;
    resendTimer.textContent = `Resend OTP in ${timeLeft}s`;
  }, 1000);
}