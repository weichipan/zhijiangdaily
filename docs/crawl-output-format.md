# 抓取输出格式

这个文件定义“抓取器跑完之后，应该吐出什么结构的数据”，用于连接：

- 原始来源抓取
- 主题过滤
- 草稿生成
- 后台审核
- 后续 KV 存储

## 设计目标

- 让不同来源的抓取结果能落到统一格式
- 让过滤结果可解释，而不是只给一个通过/不通过
- 先满足第一阶段日报生产，再逐步细化

## 一、推荐的顶层输出结构

建议一次“按日报日期”的抓取任务，输出一个统一对象：

```json
{
  "date": "2026-06-01",
  "runId": "crawl-2026-06-02-morning",
  "startedAt": "2026-06-02T07:02:11+08:00",
  "finishedAt": "2026-06-02T07:03:48+08:00",
  "status": "success",
  "sourcesUsed": [],
  "scheduleItems": [],
  "liveMetrics": [],
  "clipCandidates": [],
  "topicSourceCandidates": [],
  "logs": [],
  "stats": {}
}
```

## 二、顶层字段说明

- `date`：这次抓取要生成哪一天的日报，通常是“昨天”
- `runId`：一次抓取任务的唯一 ID
- `startedAt` / `finishedAt`：抓取开始与结束时间
- `status`：`success` / `partial_success` / `failed`
- `sourcesUsed`：本次实际使用到的来源 ID 列表
- `scheduleItems`：日程抓取结果
- `liveMetrics`：直播数据抓取结果
- `clipCandidates`：切片候选结果
- `topicSourceCandidates`：热点总结的来源候选
- `logs`：本次抓取过程日志
- `stats`：本次抓取的统计摘要

## 三、切片候选输出格式

切片抓取最适合先落成“候选列表”，而不是直接落成最终日报内容。

### 建议字段

- `id`
- `date`
- `sourceAccountId`
- `sourceAccountLabel`
- `sourceCategory`
- `platform`
- `title`
- `videoUrl`
- `coverUrl`
- `publishTime`
- `durationSeconds`
- `views`
- `likes`
- `coins`
- `favorites`
- `shares`
- `comments`
- `matchedMembers`
- `matchedGroups`
- `matchedTopics`
- `relevanceType`
- `filterPassed`
- `filterReason`
- `priority`
- `rawSource`
- `notes`

### 核心说明

- `sourceAccountId`：对应 `data/source-accounts.json` 中的来源 ID
- `sourceCategory`：`core_clipper` / `theme_clipper` / `search_result`
- `matchedMembers`：命中的成员数组
- `matchedGroups`：命中的团体 / 项目数组
- `matchedTopics`：命中的主题数组，如 `["鸣潮"]`
- `filterPassed`：是否通过过滤
- `filterReason`：为什么通过或为什么淘汰
- `rawSource`：抓取到的原始元数据，可保留关键字段，便于复核

## 四、推荐的 filterReason 枚举

建议第一阶段至少支持这些值：

- `passed_core_clipper_threshold`
- `passed_theme_clipper_topic_match`
- `rejected_below_view_threshold`
- `rejected_missing_member_or_group_match`
- `rejected_missing_topic_match`
- `rejected_irrelevant_search_result`

这样后面你在后台看“为什么没抓进来”时，会非常直观。

## 五、热点来源候选输出格式

这层是给“热点总结与反馈”用的，不一定直接展示在前台。

### 建议字段

- `id`
- `date`
- `sourceType`
- `sourceAccountId`
- `sourceAuthor`
- `sourceUrl`
- `publishTime`
- `contentSnippet`
- `matchedMembers`
- `matchedGroups`
- `matchedTopics`
- `relevanceType`
- `filterPassed`
- `filterReason`
- `sentiment`
- `confidence`
- `notes`

## 六、抓取日志输出格式

建议每次抓取保留简洁日志，便于后台查看问题。

### 建议字段

- `id`
- `runId`
- `level`
- `stage`
- `message`
- `sourceId`
- `timestamp`

### 建议值

- `level`：`info` / `warn` / `error`
- `stage`：
  - `load_sources`
  - `fetch_schedule`
  - `fetch_live_metrics`
  - `fetch_clips`
  - `filter_candidates`
  - `finalize_output`

## 七、抓取统计摘要格式

建议每次抓取产出一组简单统计：

```json
{
  "scheduleCount": 3,
  "liveMetricCount": 2,
  "clipCandidateCount": 26,
  "clipPassedCount": 8,
  "topicSourceCandidateCount": 14,
  "errorCount": 1
}
```

## 八、模拟输出示例

下面给一条切片候选的模拟例子：

```json
{
  "id": "clip-1845224-bv1xx411",
  "date": "2026-06-01",
  "sourceAccountId": "clipper-qieli",
  "sourceAccountLabel": "切离",
  "sourceCategory": "theme_clipper",
  "platform": "bilibili",
  "title": "嘉然鸣潮跑图高能片段",
  "videoUrl": "https://www.bilibili.com/video/BV1xx411xxxx",
  "coverUrl": "https://i0.hdslb.com/example.jpg",
  "publishTime": "2026-06-01T23:28:00+08:00",
  "durationSeconds": 241,
  "views": 9621,
  "likes": 1154,
  "coins": 402,
  "favorites": 688,
  "shares": 44,
  "comments": 91,
  "matchedMembers": ["嘉然"],
  "matchedGroups": [],
  "matchedTopics": ["鸣潮"],
  "relevanceType": "game_related",
  "filterPassed": true,
  "filterReason": "passed_theme_clipper_topic_match",
  "priority": "high",
  "rawSource": {
    "uid": "1845224",
    "viewText": "9621",
    "titleText": "嘉然鸣潮跑图高能片段"
  },
  "notes": "游戏向切片员，命中成员与主题双条件。"
}
```

再给一条未通过的例子：

```json
{
  "id": "clip-99493519-bv1yy422",
  "date": "2026-06-01",
  "sourceAccountId": "clipper-qiqiujuedouwang",
  "sourceAccountLabel": "七丘决斗王",
  "sourceCategory": "theme_clipper",
  "platform": "bilibili",
  "title": "鸣潮新剧情演出回顾",
  "videoUrl": "https://www.bilibili.com/video/BV1yy422yyyy",
  "publishTime": "2026-06-01T22:55:00+08:00",
  "views": 12042,
  "matchedMembers": [],
  "matchedGroups": [],
  "matchedTopics": ["鸣潮"],
  "relevanceType": "game_related",
  "filterPassed": false,
  "filterReason": "rejected_missing_member_or_group_match",
  "priority": "low",
  "rawSource": {
    "uid": "99493519"
  },
  "notes": "只命中游戏主题，未命中成员或团体。"
}
```

## 九、第一阶段最小实现建议

如果先求稳，第一阶段抓取器至少应保证输出这些字段：

- `id`
- `date`
- `sourceAccountId`
- `title`
- `videoUrl`
- `publishTime`
- `views`
- `matchedMembers`
- `matchedTopics`
- `filterPassed`
- `filterReason`

## 十、后续维护规则

以下变化发生时，应优先更新本文件：

- 抓取器顶层返回结构变化
- 过滤输出字段变化
- `filterReason` 枚举变化
- 后台审核页需要展示新的抓取结果信息
