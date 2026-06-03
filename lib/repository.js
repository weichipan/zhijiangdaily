import { readStore, writeStore } from "./storage";

export async function getSources() {
  return readStore("sources");
}

export async function saveSources(sources) {
  return writeStore("sources", sources);
}

export async function getSettings() {
  return readStore("settings");
}

export async function saveSettings(settings) {
  return writeStore("settings", settings);
}

export async function getRawItems() {
  return readStore("rawItems");
}

export async function saveRawItems(items) {
  return writeStore("rawItems", items);
}

export async function appendRawItems(items) {
  const current = await getRawItems();
  const deduped = new Map();

  for (const item of [...current, ...items]) {
    deduped.set(item.dedupeKey, item);
  }

  const merged = [...deduped.values()].sort((a, b) =>
    a.publishTime < b.publishTime ? 1 : -1,
  );

  await saveRawItems(merged);
  return merged;
}

export async function getClipCandidates() {
  return readStore("clipCandidates");
}

export async function saveClipCandidates(items) {
  return writeStore("clipCandidates", items);
}

export async function appendClipCandidates(items) {
  const current = await getClipCandidates();
  const deduped = new Map();

  for (const item of [...current, ...items]) {
    deduped.set(item.id, item);
  }

  const merged = [...deduped.values()].sort((a, b) =>
    (a.publishTime || "") < (b.publishTime || "") ? 1 : -1,
  );

  await saveClipCandidates(merged);
  return merged;
}

export async function getScheduleItems() {
  return readStore("scheduleItems");
}

export async function saveScheduleItems(items) {
  return writeStore("scheduleItems", items);
}

export async function getScheduleItemsByDate(date) {
  const items = await getScheduleItems();
  return items.filter((item) => item.date === date);
}

export async function appendScheduleItems(items) {
  const current = await getScheduleItems();
  const deduped = new Map();

  for (const item of [...current, ...items]) {
    deduped.set(item.id, item);
  }

  const merged = [...deduped.values()].sort((a, b) =>
    (a.plannedStartTime || "") > (b.plannedStartTime || "") ? 1 : -1,
  );

  await saveScheduleItems(merged);
  return merged;
}

export async function getCrawlRuns() {
  return readStore("crawlRuns");
}

export async function saveCrawlRuns(items) {
  return writeStore("crawlRuns", items);
}

export async function addCrawlRun(run) {
  const current = await getCrawlRuns();
  const next = [run, ...current].slice(0, 60);
  await saveCrawlRuns(next);
  return run;
}

export async function getIssues() {
  return readStore("issues");
}

export async function saveIssues(issues) {
  return writeStore("issues", issues);
}

export async function getIssueByDate(date) {
  const issues = await getIssues();
  return issues.find((issue) => issue.date === date) ?? null;
}

export async function upsertIssue(issue) {
  const issues = await getIssues();
  const next = [...issues];
  const index = next.findIndex((entry) => entry.date === issue.date);

  if (index >= 0) {
    next[index] = issue;
  } else {
    next.push(issue);
  }

  next.sort((a, b) => (a.date < b.date ? 1 : -1));
  await saveIssues(next);
  return issue;
}

export async function getLatestPublishedIssue() {
  const issues = await getIssues();
  return issues.find((issue) => issue.status === "published") ?? null;
}

export async function getLogs() {
  return readStore("logs");
}

export async function addLog(entry) {
  const logs = await getLogs();
  const next = [entry, ...logs].slice(0, 120);
  await writeStore("logs", next);
  return entry;
}
