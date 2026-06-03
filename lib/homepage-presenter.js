const MEMBER_PRESETS = [
  {
    id: "diana",
    memberLabel: "嘉然 Diana",
    memberName: "嘉然",
    reportTitle: "晚间互动时间",
    accent: "pink",
    fallbackStatus: "今天适合关注互动氛围、聊天节奏和观众反应。",
    feedback: "今天的高频反馈更适合整理成互动热词和名场面摘要。",
  },
  {
    id: "eileen",
    memberLabel: "乃琳 Eileen",
    memberName: "乃琳",
    reportTitle: "夜谈氛围记录",
    accent: "purple",
    fallbackStatus: "夜谈和情绪向内容通常更适合做温和的日报段落。",
    feedback: "适合补充更细的评论区摘录和情绪向反馈观察。",
  },
  {
    id: "bella",
    memberLabel: "贝拉 Bella",
    memberName: "贝拉",
    reportTitle: "舞台感重点观察",
    accent: "blue",
    fallbackStatus: "偏表演型内容更适合作为晚间焦点和切片重点。",
    feedback: "如果有关联回放或高播放切片，优先整理舞台感最强的片段。",
  },
  {
    id: "xinyi",
    memberLabel: "心宜 XinYi",
    memberName: "心宜",
    reportTitle: "清爽日常条目",
    accent: "mint",
    fallbackStatus: "当前先保留为日常观察位，后续继续补齐更完整的日程和动态。",
    feedback: "适合继续补充动态和评论区反馈，做成更轻盈的日报块。",
  },
  {
    id: "sinuo",
    memberLabel: "思诺 SiNuo",
    memberName: "思诺",
    reportTitle: "闪耀舞台观察位",
    accent: "gold",
    fallbackStatus: "当前先保留为观察位，等更多稳定来源接入后再继续细化。",
    feedback: "适合后续扩成更完整的成员观察条目，和主日报保持同结构。",
  },
];

const MEMBER_BY_NAME = new Map(MEMBER_PRESETS.map((member) => [member.memberName, member]));

const MEMBER_BY_ID_HINT = new Map([
  ["diana", MEMBER_PRESETS[0]],
  ["eileen", MEMBER_PRESETS[1]],
  ["bella", MEMBER_PRESETS[2]],
  ["xinyi", MEMBER_PRESETS[3]],
  ["sinuo", MEMBER_PRESETS[4]],
]);

const ACCENT_STYLES = {
  pink: {
    badge: "bg-[#FCE1EA] text-[#B45473] border-[#F2C2D2]",
    glow: "from-[#F8B6C8]/80 via-[#FDE7EF] to-white",
    dot: "bg-[#F8B6C8]",
  },
  purple: {
    badge: "bg-[#EEE9FF] text-[#6D5CB2] border-[#D4C8FF]",
    glow: "from-[#DCCFFF]/80 via-[#F5F0FF] to-white",
    dot: "bg-[#B9A7F5]",
  },
  blue: {
    badge: "bg-[#E7F4FF] text-[#4E7BB1] border-[#C8E5FF]",
    glow: "from-[#CCE6FF]/80 via-[#F2FAFF] to-white",
    dot: "bg-[#A8D8FF]",
  },
  mint: {
    badge: "bg-[#E7FBF6] text-[#4A8F81] border-[#C8EFE5]",
    glow: "from-[#D5F4EC]/80 via-[#F3FFFB] to-white",
    dot: "bg-[#99E3CF]",
  },
  gold: {
    badge: "bg-[#FFF2DB] text-[#A77A2F] border-[#F8D89B]",
    glow: "from-[#FFE9BF]/80 via-[#FFF9E9] to-white",
    dot: "bg-[#F7CE74]",
  },
};

function pickMemberFromScheduleItem(item = {}, index = 0) {
  if (item.member && MEMBER_BY_NAME.has(item.member)) {
    return MEMBER_BY_NAME.get(item.member);
  }

  const idHint = String(item.id || "").toLowerCase();
  for (const [key, preset] of MEMBER_BY_ID_HINT.entries()) {
    if (idHint.includes(key)) {
      return preset;
    }
  }

  return MEMBER_PRESETS[index] ?? MEMBER_PRESETS[0];
}

function cleanValue(value, fallback) {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  if (value.includes("锟") || value.includes("閺") || value.includes("閸") || value.includes("瀵")) {
    return fallback;
  }

  return value.trim();
}

function parseLiveMetric(metricValue) {
  if (!metricValue) {
    return { liveCount: "0", totalCount: "0" };
  }

  const [liveCount = "0", totalCount = "0"] = String(metricValue).split("/");
  return { liveCount, totalCount };
}

function buildScheduleRows(latestIssue) {
  const rawRows = latestIssue?.schedule ?? [];

  if (rawRows.length === 0) {
    return MEMBER_PRESETS.slice(0, 3).map((member, index) => ({
      id: `${member.id}-sample-${index}`,
      time: ["19:30", "20:00", "21:00"][index] ?? "待更新",
      member: member.memberName,
      memberLabel: member.memberLabel,
      title: member.reportTitle,
      highlights: member.fallbackStatus,
      shortNote: "等待排班确认",
      accent: member.accent,
    }));
  }

  return rawRows.slice(0, 5).map((item, index) => {
    const member = pickMemberFromScheduleItem(item, index);
    const highlights = cleanValue(item.highlights, member.fallbackStatus);

    return {
      id: item.id || `${member.id}-${index}`,
      time: cleanValue(item.time, "待确认"),
      member: member.memberName,
      memberLabel: member.memberLabel,
      title: cleanValue(item.title, member.reportTitle),
      highlights,
      shortNote: highlights
        .split(" / ")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(" · "),
      accent: member.accent,
    };
  });
}

function withImages(member, memberImages = {}) {
  return {
    ...member,
    imageSrc: memberImages[member.id] ?? null,
  };
}

export function buildHomepageView({ latestIssue, history, todayLabel, todayDateCard, imageSet }) {
  const scheduleRows = buildScheduleRows(latestIssue);
  const liveMetric = [...(latestIssue?.metrics ?? [])].find((item) => String(item.id).includes("metric-live"));
  const onlineMetric = [...(latestIssue?.metrics ?? [])].find((item) => String(item.id).includes("metric-online"));
  const sourceMetric = [...(latestIssue?.metrics ?? [])].find((item) => String(item.id).includes("metric-source"));
  const { liveCount, totalCount } = parseLiveMetric(liveMetric?.value);

  const memberImages = imageSet?.members ?? {};
  const groupImages = imageSet?.groups ?? {};

  const recentReports = MEMBER_PRESETS.map((member, index) => ({
    ...withImages(member, memberImages),
    id: `${member.id}-report`,
    date: latestIssue?.date ?? todayLabel,
    href: latestIssue ? `/daily/${latestIssue.date}` : "/admin",
    rotation: ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1"][index] ?? "",
  }));

  const headlines = MEMBER_PRESETS.map((member, index) => {
    const row = scheduleRows.find((item) => item.member === member.memberName) ?? scheduleRows[index];
    return {
      ...withImages(member, memberImages),
      id: `${member.id}-headline`,
      accent: member.accent,
      status: row ? `${row.time} · ${cleanValue(row.title, member.reportTitle)}` : member.fallbackStatus,
    };
  });

  const summaryCards = [
    {
      id: "live-count",
      label: "日程场次",
      value: totalCount,
      note: `当前正在直播 ${liveCount} 场`,
      icon: "✦",
      accent: "pink",
    },
    {
      id: "watch-total",
      label: "在线总量",
      value: onlineMetric?.value ?? "0",
      note: "根据当前草稿已入库的直播原料汇总",
      icon: "◌",
      accent: "blue",
    },
    {
      id: "source-total",
      label: "当日原料",
      value: sourceMetric?.value ?? "0",
      note: "后续会继续叠加动态、回放和切片来源",
      icon: "✺",
      accent: "purple",
    },
  ];

  const feedbackCards = MEMBER_PRESETS.slice(0, 3).map((member, index) => ({
    ...withImages(member, memberImages),
    id: `${member.id}-feedback`,
    text: cleanValue(latestIssue?.feedback?.[index]?.text, member.feedback),
  }));

  return {
    hero: {
      tagline: "TODAY'S FOCUS",
      title: "记录每一次闪耀",
      copy: "用日程、数据和观察，把每天的直播变化整理成真正可读的枝江日报。",
      badge: latestIssue?.status === "published" ? "PUBLISHED ISSUE" : "DAILY SCRAPBOOK",
      focusDate: todayDateCard,
      backgroundImageSrc: groupImages.hero ?? groupImages.asoul ?? null,
      members: MEMBER_PRESETS.map((member) => withImages(member, memberImages)),
    },
    nav: {
      dateCard: todayDateCard,
      latestHref: latestIssue ? `/daily/${latestIssue.date}` : "/admin",
    },
    latestIssue: {
      headline: cleanValue(latestIssue?.headline, "枝江日报当日焦点"),
      summary: cleanValue(
        latestIssue?.summary,
        "首页会优先展示当天的日程、摘要和观察位，后续再继续补齐更完整的数据链路。",
      ),
    },
    recentReports,
    headlines,
    scheduleRows,
    summaryCards,
    feedbackCards,
    archive: (history ?? []).slice(0, 5).map((item) => ({
      id: item.id,
      href: `/daily/${item.date}`,
      date: item.date,
      label: cleanValue(item.headline, `枝江日报 ${item.date}`),
    })),
    decorativeImages: {
      feature: groupImages.feature ?? groupImages.xiaoxinsi ?? groupImages.asoul ?? null,
      feedback: groupImages.feedback ?? groupImages.asoul ?? null,
      empty: groupImages.empty ?? groupImages.xiaoxinsi ?? groupImages.asoul ?? null,
    },
  };
}

export function getAccentClasses(accent) {
  return ACCENT_STYLES[accent] ?? ACCENT_STYLES.pink;
}
