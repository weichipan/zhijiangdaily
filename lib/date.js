import { SH_TZ } from "./constants";

function getShanghaiParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return values;
}

export function getTodayDateString(date = new Date()) {
  const parts = getShanghaiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatIssueDate(dateString) {
  const date = new Date(`${dateString}T12:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: SH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getDateStringFromTimestamp(value) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getTodayDateString(date);
}

export function toShanghaiIsoString(value) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}
