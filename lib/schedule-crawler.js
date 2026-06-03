import { getDateStringFromTimestamp, getTodayDateString, toShanghaiIsoString } from "./date";

const CALENDAR_URL = "https://asoul.love/";

const HOST_MEMBER_MAP = {
  bella: {
    member: "贝拉",
    group: "A-SOUL",
    officialSourceId: "member-bella-official",
  },
  diana: {
    member: "嘉然",
    group: "A-SOUL",
    officialSourceId: "member-diana-official",
  },
  eileen: {
    member: "乃琳",
    group: "A-SOUL",
    officialSourceId: "member-eileen-official",
  },
  fiona: {
    member: "心宜",
    group: "枝江二期闪耀舞台",
    officialSourceId: "member-xinyi-official",
  },
  gladys: {
    member: "思诺",
    group: "枝江二期闪耀舞台",
    officialSourceId: "member-sinuo-official",
  },
};

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function unwrapAstroNode(node) {
  if (Array.isArray(node) && node.length === 2 && typeof node[0] === "number") {
    if (node[0] === 0) {
      return unwrapAstroNode(node[1]);
    }

    if (node[0] === 1 && Array.isArray(node[1])) {
      return node[1].map(unwrapAstroNode);
    }
  }

  if (Array.isArray(node)) {
    return node.map(unwrapAstroNode);
  }

  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, unwrapAstroNode(value)]),
    );
  }

  return node;
}

function getCalendarSource(sources = []) {
  return (
    sources.find((source) => source.type === "schedule_site" && source.enabled) || {
      id: "schedule-site-asoul-love",
      label: "A-SOUL / 枝江日程站",
      url: CALENDAR_URL,
    }
  );
}

function getRoomIdByHost(host, sources = []) {
  const profile = HOST_MEMBER_MAP[host];
  if (!profile?.officialSourceId) {
    return "";
  }

  return (
    sources.find((source) => source.id === profile.officialSourceId)?.roomId || ""
  );
}

function mapStatus(status) {
  if (status === "cancelled") {
    return "cancelled";
  }

  return "scheduled";
}

function formatEventTitle(event, memberName) {
  const title = event.title?.trim();
  const description = event.description?.trim();

  if (title && description && title !== description) {
    return `${title}｜${description}`;
  }

  if (description) {
    return description;
  }

  if (title) {
    return title;
  }

  return `${memberName}直播`;
}

function normalizeScheduleEvent(event, calendarSource, sources) {
  const profile = HOST_MEMBER_MAP[event.host] || {
    member: event.host,
    group: "unknown",
    officialSourceId: "",
  };
  const plannedStartTime = toShanghaiIsoString(event.startTime);
  const date = getDateStringFromTimestamp(event.startTime);
  const roomId = getRoomIdByHost(event.host, sources);

  const notes = [
    event.type ? `类型：${event.type}` : "",
    event.source ? `来源：${event.source}` : "",
    event.status === "rescheduled" ? "站点标记为改期记录，当前保留最新时间。" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `schedule:${event.id}`,
    date,
    member: profile.member,
    group: profile.group,
    title: formatEventTitle(event, profile.member),
    plannedStartTime,
    plannedEndTime: null,
    platform: "bilibili",
    roomId,
    sourceType: "schedule_site",
    sourceUrl: calendarSource.url,
    status: mapStatus(event.status),
    notes,
    rawPayload: {
      host: event.host,
      performers: event.performers || [],
      rawStatus: event.status || "",
      source: event.source || "",
      sourceId: event.sourceId || "",
      updateSourceId: event.updateSourceId || "",
      recordings: event.recordings || [],
    },
  };
}

async function fetchCalendarHomepage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Referer: url,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`日程站抓取失败：${response.status}`);
  }

  return response.text();
}

function extractInitialEvents(html) {
  const matches = [...html.matchAll(/component-export="([^"]+)"[\s\S]*?props="([\s\S]*?)"\s+ssr/g)];
  const calendarMatch = matches.find((match) => match[1] === "FilterableCalendar");

  if (!calendarMatch) {
    throw new Error("未找到日程组件的初始数据。");
  }

  const props = JSON.parse(decodeHtmlEntities(calendarMatch[2]));
  const events = unwrapAstroNode(props.initialEvents);

  if (!Array.isArray(events)) {
    throw new Error("日程组件初始事件解析失败。");
  }

  return events;
}

export async function runScheduleCrawler({
  date = getTodayDateString(),
  sources = [],
} = {}) {
  const calendarSource = getCalendarSource(sources);
  const html = await fetchCalendarHomepage(calendarSource.url || CALENDAR_URL);
  const initialEvents = extractInitialEvents(html);
  const normalized = initialEvents.map((event) =>
    normalizeScheduleEvent(event, calendarSource, sources),
  );

  const matchedItems = normalized.filter((item) => item.date === date);

  return {
    runType: "schedule",
    targetDate: date,
    sourceId: calendarSource.id,
    sourceUrl: calendarSource.url,
    fetchedAt: new Date().toISOString(),
    stats: {
      totalFetched: initialEvents.length,
      matchedDateCount: matchedItems.length,
    },
    scheduleItems: matchedItems,
  };
}
