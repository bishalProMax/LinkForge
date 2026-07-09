import type { ExpiryDisplay } from "../../modules/url/url.types.js";
const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "always", style: "long" });

const formatUnitPart = (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
  return rtf
    .formatToParts(value, unit)
    .filter((part) => part.type !== "literal" || !/^(in|ago)\s*$/i.test(part.value.trim()))
    .map((part) => part.value)
    .join("")
    .trim();
};

export const getExpiryDisplay = (expiresAt?: Date | null): ExpiryDisplay => {
  if (!expiresAt) {
    return { text: "Never", title: "This link never expires" };
  }

  const title = expiresAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { text: "-", title };
  }

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  // < 1 minute
  if (diffMs < MINUTE) {
    return { text: "Less than a minute", title };
  }

  // 1–59 minutes
  if (diffMs < HOUR) {
    const minutes = Math.round(diffMs / MINUTE);
    
    if (minutes >= 60) {
      return { text: `${formatUnitPart(1, "hour")} left`, title };
    }
    return { text: `${formatUnitPart(minutes, "minute")} left`, title };
  }

  
  if (diffMs < DAY) {
    const totalMinutes = Math.round(diffMs / MINUTE);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours >= 24) {
      return { text: "Tomorrow", title };
    }
    const hourPart = formatUnitPart(hours, "hour");
    if (minutes === 0) {
      return { text: `${hourPart} left`, title };
    }
    const minutePart = formatUnitPart(minutes, "minute");
    return { text: `${hourPart} ${minutePart} left`, title };
  }

  // 24–48 hours
  if (diffMs < 2 * DAY) {
    return { text: "Tomorrow", title };
  }

  // 48–72 hours
  if (diffMs < 3 * DAY) {
    return { text: `${formatUnitPart(2, "day")} left`, title };
  }

  // 72–96 hours
  if (diffMs < 4 * DAY) {
    return { text: `${formatUnitPart(3, "day")} left`, title };
  }

  // Beyond 4 days — exact date
  return {
    text: expiresAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    title,
  };
};