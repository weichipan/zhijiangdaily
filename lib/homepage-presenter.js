const MEMBER_PRESETS = [
  {
    id: "diana",
    memberLabel: "嘉然 Diana",
    memberName: "嘉然",
    reportTitle: "综艺节奏",
    accent: "pink",
    fallbackStatus: "今天以轻快互动和观众点歌为主。",
    feedback: "今天的互动热度很稳，适合继续补充高能切片和观众热词。",
  },
  {
    id: "eileen",
    memberLabel: "乃琳 Eileen",
    memberName: "乃琳",
    reportTitle: "夜谈氛围",
    accent: "purple",
    fallbackStatus: "夜谈和剧情向内容依旧最能拉住停留。",
    feedback: "适合整理情绪类反馈和长评评论，做成更柔和的日报段落。",
  },
  {
    id: "bella",
    memberLabel: "贝拉 Bella",
    memberName: "贝拉",
    reportTitle: "舞台张力",
    accent: "blue",
    fallbackStatus: "偏强节奏内容更适合做晚间焦点。",
    feedback: "如果有回放和切片，优先抽取舞台感最强的片段做摘要。",
  },
  {
    id: "xinyi",
    memberLabel: "心宜 XinYi",
    memberName: "心宜",
    reportTitle: "清澈治愈",
    accent: "mint",
    fallbackStatus: "当前首页先保留占位，后续接入更完整的日更观察。",
    feedback: "等补充正式图和动态来源后，可以加入更完整的日报卡。",
  },
  {
    id: "sinuo",
    memberLabel: "思诺 SiNuo",
    memberName: "思诺",
    reportTitle: "元气闪耀",
    accent: "gold",
    fallbackStatus: "当前首页先保留占位，后续接入更完整的日更观察。",
    feedback: "适合后续扩展成新成员观察位，和主日报保持同样结构。",
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
  if (typeof value !== "string") {
    return fallback;
  }

  if (value.includes("�") || value.includes("鏃") || value.includes("鍢") || value.includes("寰")) {
    return fallback;
  }

  return value;
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
      accent: member.accent,
    }));
  }

  return rawRows.slice(0, 5).map((item, index) => {
    const member = pickMemberFromScheduleItem(item, index);

    return {
      id: item.id || `${member.id}-${index}`,
      time: cleanValue(item.time, "待更新"),
      member: member.memberName,
      memberLabel: member.memberLabel,
      title: cleanValue(item.title, member.reportTitle),
      highlights: cleanValue(item.highlights, member.fallbackStatus),
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
      status: row ? `${row.time} · ${cleanValue(row.title, member.reportTitle)}` : member.fallbackStatus,
    };
  });

  const summaryCards = [
    {
      id: "live-count",
      label: "直播场次",
      value: liveCount,
      note: `当前已整理 ${totalCount} 个观察位`,
      icon: "✦",
      accent: "pink",
    },
    {
      id: "watch-total",
      label: "观看总量",
      value: onlineMetric?.value ?? "0",
      note: "根据当前日报草稿汇总",
      icon: "♥",
      accent: "blue",
    },
    {
      id: "fan-growth",
      label: "新增粉丝",
      value: sourceMetric ? `+${sourceMetric.value}` : "--",
      note: sourceMetric ? "当前先用样本热度占位" : "待接入更完整采集",
      icon: "♫",
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
      copy: "用数据和观察，见证她们的成长与热爱。",
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
        "今天的首页先以视觉化日报方式呈现重点板块，后续会继续接入更完整的直播与反馈数据。",
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
