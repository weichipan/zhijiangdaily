import { fetchClipCandidatesForSource } from "./bilibili";
import { getDateStringFromTimestamp } from "./date";
import { evaluateClipCandidate } from "./clip-filter";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function buildClipCandidateId(source, rawCandidate, index) {
  const stablePart =
    rawCandidate.videoId ||
    rawCandidate.bvid ||
    rawCandidate.aid ||
    rawCandidate.videoUrl ||
    `${source.uid}-${index}`;

  return `clip-${source.uid}-${String(stablePart).replace(/[^\w-]/g, "").slice(0, 48)}`;
}

function buildSourceText(rawCandidate) {
  return [rawCandidate.title, rawCandidate.description, rawCandidate.tagText, rawCandidate.extraText]
    .filter(Boolean)
    .join("\n");
}

export function buildClipCandidateFromRaw({ date, source, rawCandidate, index = 0 }) {
  const title = rawCandidate.title || "未命名切片";
  const description = buildSourceText(rawCandidate);
  const viewCount = toNumber(rawCandidate.views ?? rawCandidate.viewCount ?? rawCandidate.play);
  const filter = evaluateClipCandidate({
    source,
    title,
    description,
    viewCount,
  });

  return {
    id: buildClipCandidateId(source, rawCandidate, index),
    date,
    sourceAccountId: source.id,
    sourceAccountLabel: source.label,
    sourceCategory: filter.sourceCategory,
    platform: source.platform || "bilibili",
    title,
    videoUrl: rawCandidate.videoUrl || rawCandidate.url || "",
    coverUrl: rawCandidate.coverUrl || rawCandidate.cover || "",
    publishTime: rawCandidate.publishTime || rawCandidate.pubdate || "",
    durationSeconds: toNumber(rawCandidate.durationSeconds ?? rawCandidate.duration),
    views: viewCount,
    likes: toNumber(rawCandidate.likes),
    coins: toNumber(rawCandidate.coins),
    favorites: toNumber(rawCandidate.favorites),
    shares: toNumber(rawCandidate.shares),
    comments: toNumber(rawCandidate.comments),
    matchedMembers: filter.matchedMembers,
    matchedGroups: filter.matchedGroups,
    matchedTopics: filter.matchedTopics,
    relevanceType: filter.relevanceType,
    filterPassed: filter.filterPassed,
    filterReason: filter.filterReason,
    priority: filter.priority,
    rawSource: {
      videoId: rawCandidate.videoId || rawCandidate.bvid || rawCandidate.aid || "",
      titleText: rawCandidate.title || "",
      viewText: String(rawCandidate.views ?? rawCandidate.viewCount ?? rawCandidate.play ?? ""),
      descriptionText: rawCandidate.description || "",
    },
    notes: rawCandidate.notes || "",
  };
}

function createLogEntry({ runId, level = "info", stage, message, sourceId = "" }) {
  return {
    id: `${runId}-${stage}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    runId,
    level,
    stage,
    message,
    sourceId,
    timestamp: new Date().toISOString(),
  };
}

export function createClipCrawlRun({ date, sourcesUsed, clipCandidates, logs, startedAt, finishedAt }) {
  const passedCandidates = clipCandidates.filter((item) => item.filterPassed);
  const errorCount = logs.filter((entry) => entry.level === "error").length;

  return {
    date,
    runId: `clip-crawl-${date}-${Date.now()}`,
    startedAt,
    finishedAt,
    status: errorCount > 0 ? "partial_success" : "success",
    sourcesUsed,
    scheduleItems: [],
    liveMetrics: [],
    clipCandidates,
    topicSourceCandidates: [],
    logs,
    stats: {
      scheduleCount: 0,
      liveMetricCount: 0,
      clipCandidateCount: clipCandidates.length,
      clipPassedCount: passedCandidates.length,
      topicSourceCandidateCount: 0,
      errorCount,
    },
  };
}

export async function runClipCrawlSkeleton({
  date,
  sources,
  rawCandidatesBySource = {},
  cookie = "",
}) {
  const startedAt = new Date().toISOString();
  const clipperSources = sources.filter((source) => source.enabled && source.type === "clipper_account");
  const logs = [];
  const clipCandidates = [];
  const sourcesUsed = clipperSources.map((source) => source.id);

  logs.push(
    createLogEntry({
      runId: `clip-crawl-${date}`,
      stage: "load_sources",
      message: `已载入 ${clipperSources.length} 个启用的切片来源`,
    }),
  );

  for (const source of clipperSources) {
    let rawCandidates = toArray(rawCandidatesBySource[source.id]);

    if (rawCandidates.length === 0 && source.group === "A-SOUL / Zhijiang") {
      try {
        rawCandidates = await fetchClipCandidatesForSource(source, cookie);
      } catch (error) {
        logs.push(
          createLogEntry({
            runId: `clip-crawl-${date}`,
            level: "error",
            stage: "fetch_clips",
            sourceId: source.id,
            message: `${source.label} 抓取失败：${error.message}`,
          }),
        );
        continue;
      }
    }

    if (rawCandidates.length === 0) {
      logs.push(
        createLogEntry({
          runId: `clip-crawl-${date}`,
          stage: "fetch_clips",
          sourceId: source.id,
          message:
            source.group === "A-SOUL / Zhijiang"
              ? `${source.label} 当前没有抓到符合条件的原始候选`
              : `${source.label} 当前尚未接入真实原始候选提取器`,
        }),
      );
      continue;
    }

    const dayCandidates = rawCandidates.filter(
      (rawCandidate) => getDateStringFromTimestamp(rawCandidate.publishTime) === date,
    );

    dayCandidates
      .forEach((rawCandidate, index) => {
        clipCandidates.push(
          buildClipCandidateFromRaw({
            date,
            source,
            rawCandidate,
            index,
          }),
        );
      });

    logs.push(
        createLogEntry({
          runId: `clip-crawl-${date}`,
          stage: "filter_candidates",
          sourceId: source.id,
          message: `${source.label} 已处理 ${rawCandidates.length} 条原始候选，命中日期 ${dayCandidates.length} 条`,
        }),
      );
  }

  const finishedAt = new Date().toISOString();
  return createClipCrawlRun({
    date,
    sourcesUsed,
    clipCandidates,
    logs,
    startedAt,
    finishedAt,
  });
}
