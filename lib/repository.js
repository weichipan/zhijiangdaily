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
