import { promises as fs } from "fs";
import path from "path";

import { defaultIssue, defaultLogs, defaultSettings, defaultSources } from "./seed";

const dataDir = path.join(process.cwd(), "data");
const KV_PREFIX = "zhijiang-daily";

const fileMap = {
  sources: {
    path: path.join(dataDir, "source-accounts.json"),
    fallback: defaultSources,
  },
  settings: {
    path: path.join(dataDir, "settings.json"),
    fallback: defaultSettings,
  },
  rawItems: {
    path: path.join(dataDir, "raw-items.json"),
    fallback: [],
  },
  clipCandidates: {
    path: path.join(dataDir, "clip-candidates.json"),
    fallback: [],
  },
  scheduleItems: {
    path: path.join(dataDir, "schedule-items.json"),
    fallback: [],
  },
  crawlRuns: {
    path: path.join(dataDir, "crawl-runs.json"),
    fallback: [],
  },
  issues: {
    path: path.join(dataDir, "daily-issues.json"),
    fallback: [defaultIssue],
  },
  logs: {
    path: path.join(dataDir, "crawl-logs.json"),
    fallback: defaultLogs,
  },
};

function cloneFallback(value) {
  return JSON.parse(JSON.stringify(value));
}

function getKvConfig() {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const legacyUrl = process.env.KV_REST_API_URL;
  const legacyToken = process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    return {
      url: upstashUrl.replace(/\/+$/, ""),
      token: upstashToken,
      mode: "upstash-redis",
      envSource: "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN",
    };
  }

  if (!legacyUrl || !legacyToken) {
    return null;
  }

  return {
    url: legacyUrl.replace(/\/+$/, ""),
    token: legacyToken,
    mode: "vercel-kv",
    envSource: "KV_REST_API_URL / KV_REST_API_TOKEN",
  };
}

function getKvStoreKey(key) {
  return `${KV_PREFIX}:${key}`;
}

async function kvRequest(commandPath, init = {}) {
  const config = getKvConfig();

  if (!config) {
    throw new Error("Vercel KV is not configured.");
  }

  const response = await fetch(`${config.url}/${commandPath}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${config.token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`KV request failed (${response.status}): ${detail}`);
  }

  return response;
}

async function readKvStore(key) {
  const storeKey = getKvStoreKey(key);
  const response = await kvRequest(`get/${encodeURIComponent(storeKey)}`);
  const payload = await response.json();

  if (payload.result === null || payload.result === undefined) {
    const fallback = cloneFallback(fileMap[key].fallback);
    await writeKvStore(key, fallback);
    return fallback;
  }

  return JSON.parse(payload.result);
}

async function writeKvStore(key, value) {
  const storeKey = getKvStoreKey(key);
  await kvRequest(`set/${encodeURIComponent(storeKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(value),
  });

  return value;
}

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function ensureLocalFile(key) {
  await ensureDir();
  const { path: filePath, fallback } = fileMap[key];

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function readLocalStore(key) {
  await ensureLocalFile(key);
  const filePath = fileMap[key].path;
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeLocalStore(key, value) {
  await ensureLocalFile(key);
  const filePath = fileMap[key].path;
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
  return value;
}

export function getStorageInfo() {
  const config = getKvConfig();

  if (!config) {
    return {
      mode: "local-json",
      label: "本地 JSON",
      envSource: null,
      persistentInVercel: false,
    };
  }

  return {
    mode: config.mode,
    label: config.mode === "upstash-redis" ? "Upstash Redis" : "Vercel KV",
    envSource: config.envSource,
    persistentInVercel: true,
  };
}

export function getStorageMode() {
  return getStorageInfo().mode;
}

export async function readStore(key) {
  return getKvConfig() ? readKvStore(key) : readLocalStore(key);
}

export async function writeStore(key, value) {
  return getKvConfig() ? writeKvStore(key, value) : writeLocalStore(key, value);
}
