import { getTodayDateString } from "./date";

function formatScheduleTime(plannedStartTime, status) {
  if (status === "cancelled") {
    return "已取消";
  }

  if (!plannedStartTime) {
    return "待确认";
  }

  const match = String(plannedStartTime).match(/T(\d{2}:\d{2})/);
  return match?.[1] || "待确认";
}

function buildScheduleHighlights(item = {}) {
  const parts = [];

  if (item.status === "cancelled") {
    parts.push("站点标记为取消");
  }

  if (item.rawPayload?.rawStatus === "rescheduled") {
    parts.push("原场次有改期记录");
  }

  if (Array.isArray(item.rawPayload?.recordings) && item.rawPayload.recordings.length > 0) {
    parts.push("已有关联回放");
  }

  return parts.join(" / ") || item.notes || "待补充更多直播说明";
}

function buildScheduleRowsFromScheduleItems(scheduleItems = []) {
  return [...scheduleItems]
    .sort((a, b) => ((a.plannedStartTime || "") > (b.plannedStartTime || "") ? 1 : -1))
    .map((item) => ({
      id: item.id,
      time: formatScheduleTime(item.plannedStartTime, item.status),
      member: item.member,
      title: item.title || `${item.member}直播`,
      highlights: buildScheduleHighlights(item),
    }));
}

function buildFallbackScheduleRows(date, liveItems = []) {
  return liveItems.map((item) => ({
    id: `${item.sourceId}-${date}`,
    time: item.metrics.liveStatus === 1 ? "正在直播" : "待更新 / 已下播",
    member: item.memberName,
    title: item.title || `${item.memberName} 直播间`,
    highlights:
      item.metrics.hotWords?.slice(0, 3).join(" / ") || `当前在线 ${item.metrics.online ?? 0}`,
  }));
}

function buildFeedback(liveItems, date) {
  if (liveItems.length === 0) {
    return [
      {
        id: `feedback-empty-${date}`,
        text: "今天还没有形成足够的自动反馈样本，后续可以在后台补充评论区和弹幕观察。",
      },
    ];
  }

  return liveItems.map((item) => ({
    id: `feedback-${item.sourceId}-${date}`,
    text:
      item.metrics.hotWords?.length > 0
        ? `“${item.memberName}” 当前直播热词：${item.metrics.hotWords.slice(0, 6).join("、")}。`
        : `“${item.memberName}” 当前还没有抓到稳定热词，建议发布前补充弹幕或评论区观察。`,
  }));
}

export function buildDailyDraft({
  date = getTodayDateString(),
  rawItems = [],
  scheduleItems = [],
  existingIssue,
}) {
  const liveItems = rawItems.filter((item) => item.sourceType === "member_live");
  const activeLives = liveItems.filter((item) => item.metrics.liveStatus === 1);
  const schedule =
    scheduleItems.length > 0
      ? buildScheduleRowsFromScheduleItems(scheduleItems)
      : buildFallbackScheduleRows(date, liveItems);

  const summaries = [
    {
      id: `summary-main-${date}`,
      title: "今日直播总结",
      text:
        scheduleItems.length > 0
          ? `今天共整理出 ${schedule.length} 条当日日程，其中当前正在直播 ${activeLives.length} 场。站点周表已经接入草稿，后续再继续补齐动态和直播数据。`
          : activeLives.length > 0
            ? `今天共发现 ${activeLives.length} 个成员直播间处于开播状态，系统已经根据直播间状态生成了一版草稿，等待人工审核。`
            : "今天暂未抓到结构化日程或开播状态，系统会保留现有原料，方便后续人工补录。",
    },
    {
      id: `summary-ops-${date}`,
      title: "内容观察",
      text:
        scheduleItems.length > 0
          ? "当前日程板块已经改为优先使用每日抓取的直播表，后续可继续叠加官号动态、直播间状态和回放信息做交叉校验。"
          : "当前草稿仍主要基于直播间状态生成，后续接入更完整的日程和动态来源后，信息密度会更高。",
    },
    {
      id: `summary-review-${date}`,
      title: "审核建议",
      text: "发布前建议核对成员姓名、直播主题、取消或改期状态，以及是否需要手动合并重复场次。",
    },
  ];

  const metrics = [
    {
      id: `metric-source-${date}`,
      label: "当日原料",
      value: String(rawItems.length),
      note: "已入库的抓取条目数",
    },
    {
      id: `metric-live-${date}`,
      label: "成员直播间",
      value: `${activeLives.length}/${schedule.length || liveItems.length}`,
      note: scheduleItems.length > 0 ? "正在直播数 / 当日日程数" : "开播数 / 配置总数",
    },
    {
      id: `metric-online-${date}`,
      label: "在线总量",
      value: `${liveItems.reduce((sum, item) => sum + (item.metrics.online || 0), 0)}`,
      note: "直播接口返回的在线数汇总",
    },
  ];

  return {
    id: existingIssue?.id || `issue-${date}`,
    date,
    status: existingIssue?.status === "published" ? "published" : "draft",
    headline: existingIssue?.headline || `枝江日报 ${date}`,
    summary:
      existingIssue?.summary ||
      "系统已根据当日可抓到的日程与直播原料生成草稿，待后台审核后即可对外发布。",
    schedule,
    summaries,
    metrics,
    feedback: buildFeedback(liveItems, date),
    publishedAt: existingIssue?.publishedAt || null,
    updatedAt: new Date().toISOString(),
  };
}
