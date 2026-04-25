import { getTodayDateString } from "./date";

export function buildDailyDraft({ date = getTodayDateString(), rawItems = [], existingIssue }) {
  const liveItems = rawItems.filter((item) => item.sourceType === "member_live");
  const activeLives = liveItems.filter((item) => item.metrics.liveStatus === 1);

  const schedule = liveItems.map((item) => ({
    id: `${item.sourceId}-${date}`,
    time: item.metrics.liveStatus === 1 ? "正在直播" : "待更新 / 已下播",
    member: item.memberName,
    title: item.title || `${item.memberName} 直播间`,
    highlights:
      item.metrics.hotWords?.slice(0, 3).join(" / ") ||
      `房间号 ${item.metrics.roomId}，当前在线 ${item.metrics.online ?? 0}`,
  }));

  const summaries = [
    {
      id: `summary-main-${date}`,
      title: "今日直播总结",
      text:
        activeLives.length > 0
          ? `今天共有 ${activeLives.length} 个成员直播间处于开播状态，系统已根据当前标题、热词和房间状态整理成日报草稿，等待人工修订后发布。`
          : "今天暂未检测到成员处于开播状态，系统仍会保留官方与观察位采集结果，方便你继续补充成文。",
    },
    {
      id: `summary-ops-${date}`,
      title: "内容观察",
      text:
        liveItems.length > 0
          ? "本次草稿主要基于直播间实时状态生成，后续补上官方动态、回放和切片后，日报内容密度会更完整。"
          : "当前尚无可用直播原料，建议先检查 Cookie、房间配置和采集日志。",
    },
    {
      id: `summary-review-${date}`,
      title: "审核建议",
      text: "发布前建议核对成员称呼、直播标题、热词语义和评论摘录，避免把风控页或噪声文本带进正文。",
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
      value: `${activeLives.length}/${liveItems.length}`,
      note: "开播数 / 配置总数",
    },
    {
      id: `metric-online-${date}`,
      label: "在线总量",
      value: `${liveItems.reduce((sum, item) => sum + (item.metrics.online || 0), 0)}`,
      note: "直播接口返回的在线数汇总",
    },
  ];

  const feedback = liveItems.length
    ? liveItems.map((item) => ({
        id: `feedback-${item.sourceId}-${date}`,
        text:
          item.metrics.hotWords?.length > 0
            ? `“${item.memberName}” 当前直播热词：${item.metrics.hotWords.slice(0, 6).join("、")}。`
            : `“${item.memberName}” 当前未拿到热词，建议发布前补充弹幕或评论观察。`,
      }))
    : [
        {
          id: `feedback-empty-${date}`,
          text: "今天还没有形成足够的自动反馈样本，后台保留了待审核入口，可以手工补录。",
        },
      ];

  return {
    id: existingIssue?.id || `issue-${date}`,
    date,
    status: existingIssue?.status === "published" ? "published" : "draft",
    headline: existingIssue?.headline || `枝江日报 ${date}`,
    summary:
      existingIssue?.summary ||
      "系统已根据今日可抓到的直播与账号信息生成日报草稿，待后台审核后即可对外发布。",
    schedule,
    summaries,
    metrics,
    feedback,
    publishedAt: existingIssue?.publishedAt || null,
    updatedAt: new Date().toISOString(),
  };
}
