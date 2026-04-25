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
