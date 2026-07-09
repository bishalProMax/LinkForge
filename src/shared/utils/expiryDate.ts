import type { ExpiryDisplay, GenerateShortURLProps } from "../../modules/url/url.types.js";
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

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;

  if (diffMs <= 0) {
    const pastDiffMs = Math.abs(diffMs);
    const DAY = 24 * HOUR;

    if (pastDiffMs < DAY) {
      return { text: "Expired today", title };
    }
    if (pastDiffMs < 30 * DAY) {
      const days = Math.floor(pastDiffMs / DAY);
      return { text: `Expired ${formatUnitPart(days, "day")}`, title };
    }
    return {
      text: `Expired ${expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
      title,
    };
  }

  if (diffMs < MINUTE) {
    return { text: "Less than a minute", title };
  }

  if (diffMs < HOUR) {
    const minutes = Math.round(diffMs / MINUTE);
    return { text: `${formatUnitPart(minutes, "minute")} left`, title };
  }

  // Compare calendar dates, not elapsed hours
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfExpiryDay = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
  const calendarDayDiff = Math.round((startOfExpiryDay.getTime() - startOfToday.getTime()) / (24 * HOUR));

  if (calendarDayDiff === 0) {
    const hours = Math.round(diffMs / HOUR);
    return { text: `${formatUnitPart(hours, "hour")} left`, title };
  }

  if (calendarDayDiff === 1) {
    return { text: "Tomorrow", title };
  }

  if (calendarDayDiff <= 4) {
    return { text: `${formatUnitPart(calendarDayDiff, "day")} left`, title };
  }

  return {
    text: expiresAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    title,
  };
};

// Helper function to calculate the expiry date based on the expiration option
export const getExpiryDate = (expiration: GenerateShortURLProps["expiration"], customExpiry?: Date): Date | undefined => {
  const now = Date.now();

  switch (expiration) {
    case "never":
      return undefined;

    case "1d":
      return new Date(now + 24 * 60 * 60 * 1000);

    case "7d":
      return new Date(now + 7 * 24 * 60 * 60 * 1000);

    case "30d":
      return new Date(now + 30 * 24 * 60 * 60 * 1000);

    case "90d":
      return new Date(now + 90 * 24 * 60 * 60 * 1000);

    case "custom":
      return customExpiry;
  }
};