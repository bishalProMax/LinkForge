function stripBaseUrl(value) {
  if (!value) return value;
  return value.trim().replace(/^https?:\/\/[^/]+\/(url|qr)\//i, "").replace(/\/$/, "");
}

export { stripBaseUrl };