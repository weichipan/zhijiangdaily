import { getTodayDateString } from "./date";

const today = getTodayDateString();

export const defaultSources = [
  {
    id: "official-asoul",
    label: "A-SOUL 官方账号",
    type: "official_space",
    uid: "703007996",
    enabled: true,
    url: "https://space.bilibili.com/703007996",
  },
  {
    id: "diana-live",
    label: "嘉然直播间",
    type: "member_live",
    uid: "672328094",
    roomId: "22637261",
    enabled: true,
  },
  {
    id: "eileen-live",
    label: "乃琳直播间",
    type: "member_live",
    uid: "672342685",
    roomId: "22625027",
    enabled: true,
  },
  {
    id: "bella-live",
    label: "贝拉直播间",
    type: "member_live",
    uid: "672353429",
    roomId: "22632424",
    enabled: true,
  },
  {
    id: "clipper-watchlist",
    label: "切片员观察位",
    type: "clipper_account",
    uid: "",
    enabled: false,
    url: "https://www.bilibili.com",
  },
];

export const defaultSettings = {
  crawlTime: "21:30",
  bilibiliCookie: "",
  lastCookieCheckAt: null,
  timezone: "Asia/Shanghai",
};

export const defaultIssue = {
  id: `issue-${today}`,
  date: today,
  status: "draft",
  headline: "枝江日报首刊样板",
  summary:
    "当前还是演示版日报。接入真实采集后，后台会按日期生成草稿，并等待人工审核后发布。",
  schedule: [
    {
      id: "sample-1",
      time: "14:00 - 15:30",
      member: "嘉然",
      title: "午后聊天电台",
      highlights: "轻松闲聊、观众点歌、热点话题回顾",
    },
    {
      id: "sample-2",
      time: "19:30 - 21:30",
      member: "乃琳",
      title: "剧情游戏夜谈",
      highlights: "情绪陪伴、剧情讨论、角色配音",
    },
    {
      id: "sample-3",
      time: "22:00 - 23:30",
      member: "贝拉",
      title: "歌舞综艺场",
      highlights: "唱跳表演、舞台张力、晚间热度冲高",
    },
  ],
  summaries: [
    {
      id: "summary-1",
      title: "今日直播总结",
      text: "前台已经是可上线的网站结构，后续接入真实数据后，这里会自动生成当天的直播总结草稿。",
    },
    {
      id: "summary-2",
      title: "编辑备注",
      text: "首版默认以嘉然、乃琳、贝拉三位成员为核心对象，保留官方账号与切片观察位。",
    },
    {
      id: "summary-3",
      title: "发布策略",
      text: "直播总结与反馈区支持 AI 起草，但默认仍需在后台审核后再发布。",
    },
  ],
  metrics: [
    { id: "metric-1", label: "采集源数量", value: "4", note: "官方账号 1 个，成员直播间 3 个" },
    { id: "metric-2", label: "待审核状态", value: "Draft", note: "当前首刊仍处于草稿阶段" },
    { id: "metric-3", label: "更新时间区", value: "UTC+8", note: "按上海自然日生成日报" },
  ],
  feedback: [
    {
      id: "feedback-1",
      text: "“这版已经像一份完整日报了，后续只要接上真实数据就能每天看。”",
    },
    {
      id: "feedback-2",
      text: "“后台审核后再发布很重要，可以先自动抓，再手工统一一下口径。”",
    },
  ],
  publishedAt: null,
  updatedAt: new Date().toISOString(),
};

export const defaultLogs = [
  {
    id: "log-seed",
    type: "seed",
    status: "success",
    createdAt: new Date().toISOString(),
    message: "项目首次初始化完成，已注入默认日报与数据源配置。",
  },
];
