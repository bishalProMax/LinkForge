const ALL_EVENTS = [
  "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGIN_TOO_MANY_ATTEMPTS", "LOGIN_BLOCKED_UNVERIFIED", "LOGIN_BLOCKED_BANNED",
  "LOGOUT", "SESSION_REVOKED_BANNED",
  "GOOGLE_LOGIN_SUCCESS", "GOOGLE_LOGIN_REQUIRED", "GOOGLE_ACCOUNT_CREATED", "GOOGLE_ACCOUNT_LINKED",
  "SIGNUP_SUCCESS", "SIGNUP_CAPTCHA_FAILED", "SIGNUP_EMAIL_EXISTS", "SIGNUP_RESEND_LIMIT_REACHED", "SIGNUP_COOLDOWN_ACTIVE", "SIGNUP_LOCAL_AUTH_LINKED",
  "LOCAL_AUTH_REQUIRED",
  "OTP_REQUESTED", "OTP_COOLDOWN_ACTIVE", "OTP_LIMIT_REACHED", "INVALID_OTP", "OTP_EXPIRED", "OTP_TOO_MANY_ATTEMPTS", "OTP_VERIFIED",
  "PASSWORD_RESET_SESSION_EXPIRED", "PASSWORD_RESET_SAME_PASSWORD", "PASSWORD_RESET_SUCCESS", "PASSWORD_RESET_BLOCKED_BANNED",
  "RATE_LIMIT_EXCEEDED",
  "USER_BANNED", "USER_UNBANNED",
];

const SUPER_ADMIN_ONLY_EVENTS = ["ROLE_INVITE_CREATED", "ROLE_PROMOTED", "ROLE_DEMOTED"];

const toLabel = (value) =>
  value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const select = document.getElementById("eventSelect");

if (select) {
  const viewerRole = select.dataset.viewerRole;
  const selectedEvent = select.dataset.selectedEvent;

  const events = viewerRole === "SUPER_ADMIN" ? [...ALL_EVENTS, ...SUPER_ADMIN_ONLY_EVENTS] : ALL_EVENTS;

  events.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = toLabel(value);
    if (value === selectedEvent) option.selected = true;
    select.appendChild(option);
  });
}

const exportBtn = document.getElementById("exportCsvBtn");

if (exportBtn) {
  exportBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    params.delete("page");

    window.location.href = `/admin/reports/export?${params.toString()}`;
  });
}