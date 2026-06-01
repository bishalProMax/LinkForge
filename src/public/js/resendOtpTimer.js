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
