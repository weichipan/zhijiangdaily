# 数据字段模型

这个文件用于定义“抓取结果应该长什么样”，让后续的抓取、草稿生成、后台编辑、KV 存储共用同一套字段约定。

## 设计原则

- 先保证四个主板块能稳定产出
- 字段命名优先清晰，不追求过早抽象
- 允许部分字段在第一阶段为空，后续逐步补齐
- 原始抓取结果与最终日报展示结构可以不同，但应能稳定映射
- 如果字段涉及人工判断，优先保留 `notes`、`confidence`、`reviewStatus`

## 通用字段

以下字段建议在多个对象中复用：

- `id`：唯一标识
- `date`：所属日报日期，格式 `YYYY-MM-DD`
- `sourceUrl`：原始来源链接
- `createdAt`：记录创建时间
- `updatedAt`：记录更新时间
- `notes`：人工备注

## 一、每日直播日程表

### 用途

- 记录当天或次日需要关注的直播安排
- 支撑首页和详情页中的日程板块
- 为后续直播数据抓取和切片过滤提供时间窗口

### 建议字段

- `id`
- `date`
- `member`
- `group`
- `title`
- `plannedStartTime`
- `plannedEndTime`
- `platform`
- `roomId`
- `sourceType`
- `sourceUrl`
- `status`
- `notes`

### 字段说明

- `member`：`嘉然` / `乃琳` / `贝拉` / `心宜` / `思诺`
- `group`：`A-SOUL` / `枝江二期闪耀舞台`
- `plannedStartTime`：建议保存完整时间，如 `2026-06-01T19:30:00+08:00`
- `sourceType`：`schedule_site` / `official_dynamic` / `live_room` / `manual`
- `status`：`scheduled` / `live` / `finished` / `cancelled` / `tentative`

## 二、昨日直播数据

### 用途

- 记录每场直播的核心表现数据
- 为日报中的“昨日直播数据”板块提供素材
- 为后续热点判断和切片优先级提供背景

### 建议字段

- `id`
- `date`
- `member`
- `group`
- `title`
- `platform`
- `roomId`
- `startTime`
- `endTime`
- `durationMinutes`
- `avgOnline`
- `peakOnline`
- `danmakuCount`
- `giftValue`
- `newFollowers`
- `playbackViews`
- `sourceSite`
- `sourceUrl`
- `confidence`
- `notes`

### 字段说明

- `durationMinutes`：按分钟保存，方便排序和展示
- `avgOnline` / `peakOnline`：允许为空，后续根据来源能力补齐
- `giftValue`：允许先保留原始字符串或数值，后续统一格式
- `sourceSite`：如后续接入的第三方直播数据站名称
- `confidence`：`high` / `medium` / `low`

## 三、昨日高播放切片

### 用途

- 从切片员与搜索结果中筛出值得进日报的高热视频
- 为热点总结和评论区反馈提供候选入口

### 当前筛选规则

- 默认只抓取播放量 `>= 6000` 的视频
- 纯枝江 / A-SOUL 相关切片员长期纳入候选池
- 游戏向切片员只在主题命中“鸣潮 / 战双”相关时纳入候选池

### 建议字段

- `id`
- `date`
- `title`
- `clipperName`
- `clipperUid`
- `platform`
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
- `relatedMembers`
- `relatedTopics`
- `relevanceType`
- `sourceCategory`
- `priority`
- `notes`

### 字段说明

- `relatedMembers`：数组，如 `["嘉然"]` 或 `["嘉然","乃琳"]`
- `relatedTopics`：数组，如 `["鸣潮"]`
- `relevanceType`：
  - `direct_asoul`
  - `direct_zhijiang`
  - `game_related`
  - `other_related`
- `sourceCategory`：
  - `core_clipper`
  - `theme_clipper`
  - `search_result`
- `priority`：`high` / `medium` / `low`

## 四、昨日热点总结与反馈

这一块建议拆成两层，不要只保存一大段最终文案。

### 4.1 热点总结块

#### 用途

- 形成日报里可直接展示的热点段落
- 便于人工审核、改写和发布

#### 建议字段

- `id`
- `date`
- `headline`
- `summary`
- `relatedMembers`
- `relatedTopics`
- `importance`
- `sourceCount`
- `sourceRefs`
- `generatedBy`
- `reviewStatus`
- `notes`

#### 字段说明

- `importance`：`high` / `medium` / `low`
- `sourceRefs`：引用来源 ID 数组
- `generatedBy`：`manual` / `model` / `hybrid`
- `reviewStatus`：`draft` / `reviewed` / `published`

### 4.2 热点来源引用块

#### 用途

- 保存总结段落背后的引用来源
- 支撑人工复核与后续重生成

#### 建议字段

- `id`
- `date`
- `sourceType`
- `sourcePlatform`
- `sourceAuthor`
- `sourceUrl`
- `contentSnippet`
- `publishTime`
- `relatedMembers`
- `relatedTopics`
- `sentiment`
- `confidence`

#### 字段说明

- `sourceType`：
  - `official_dynamic`
  - `clip_comment`
  - `clip_video`
  - `manual_note`
- `sentiment`：
  - `positive`
  - `neutral`
  - `mixed`
  - `negative`
- `confidence`：`high` / `medium` / `low`

## 五、建议的第一阶段最小抓取字段

如果先追求“链路能跑通”，建议第一阶段只抓这些核心字段：

### 日程表

- `member`
- `title`
- `plannedStartTime`
- `sourceUrl`

### 直播数据

- `member`
- `title`
- `startTime`
- `endTime`
- `peakOnline`
- `playbackViews`

### 高播放切片

- `title`
- `clipperName`
- `videoUrl`
- `views`
- `publishTime`
- `relatedMembers`

### 热点总结

- `headline`
- `summary`
- `sourceRefs`
- `relatedMembers`

## 六、模拟抓取结果示例

下面这组示例不是实际抓取结果，只是为了说明后续数据长什么样。

```json
{
  "date": "2026-06-01",
  "scheduleItems": [
    {
      "id": "schedule-diana-2026-06-01-1930",
      "date": "2026-06-01",
      "member": "嘉然",
      "group": "A-SOUL",
      "title": "晚间杂谈 + 鸣潮",
      "plannedStartTime": "2026-06-01T19:30:00+08:00",
      "plannedEndTime": null,
      "platform": "bilibili",
      "roomId": "22637261",
      "sourceType": "schedule_site",
      "sourceUrl": "https://asoul.love/",
      "status": "scheduled",
      "notes": "由周表同步，待开播前再用直播间校验。"
    }
  ],
  "liveMetrics": [
    {
      "id": "live-diana-2026-06-01-night",
      "date": "2026-06-01",
      "member": "嘉然",
      "group": "A-SOUL",
      "title": "晚间杂谈 + 鸣潮",
      "platform": "bilibili",
      "roomId": "22637261",
      "startTime": "2026-06-01T19:32:00+08:00",
      "endTime": "2026-06-01T22:18:00+08:00",
      "durationMinutes": 166,
      "avgOnline": null,
      "peakOnline": 24563,
      "danmakuCount": null,
      "giftValue": null,
      "newFollowers": 1860,
      "playbackViews": 312000,
      "sourceSite": "example-live-metrics-site",
      "sourceUrl": "https://example.com/live/diana/2026-06-01",
      "confidence": "medium",
      "notes": "部分字段待第三方站点能力确认。"
    }
  ],
  "topClips": [
    {
      "id": "clip-11409734-bv1xx411",
      "date": "2026-06-01",
      "title": "嘉然鸣潮整活高能片段合集",
      "clipperName": "chikawa频主",
      "clipperUid": "11409734",
      "platform": "bilibili",
      "videoUrl": "https://www.bilibili.com/video/BV1xx411xxxx",
      "coverUrl": "https://i0.hdslb.com/example.jpg",
      "publishTime": "2026-06-01T23:18:00+08:00",
      "durationSeconds": 386,
      "views": 18452,
      "likes": 2231,
      "coins": 932,
      "favorites": 1450,
      "shares": 118,
      "comments": 246,
      "relatedMembers": ["嘉然"],
      "relatedTopics": ["鸣潮"],
      "relevanceType": "game_related",
      "sourceCategory": "core_clipper",
      "priority": "high",
      "notes": "命中游戏主题过滤，满足播放量阈值。"
    }
  ],
  "topicSummaries": [
    {
      "id": "topic-2026-06-01-diana-wuthering-waves",
      "date": "2026-06-01",
      "headline": "嘉然晚间鸣潮直播互动热度较高",
      "summary": "昨日嘉然晚间直播中，鸣潮相关片段在切片区和评论区都有较明显扩散，观众反馈集中在高能整活与临场反应。",
      "relatedMembers": ["嘉然"],
      "relatedTopics": ["鸣潮"],
      "importance": "high",
      "sourceCount": 3,
      "sourceRefs": [
        "official-dynamic-diana-2026-06-01",
        "clip-11409734-bv1xx411",
        "comment-sample-001"
      ],
      "generatedBy": "hybrid",
      "reviewStatus": "draft",
      "notes": "待人工补充更具体的评论区总结。"
    }
  ],
  "topicSources": [
    {
      "id": "comment-sample-001",
      "date": "2026-06-01",
      "sourceType": "clip_comment",
      "sourcePlatform": "bilibili",
      "sourceAuthor": "某用户",
      "sourceUrl": "https://www.bilibili.com/video/BV1xx411xxxx",
      "contentSnippet": "这一段反应太快了，节目效果直接拉满。",
      "publishTime": "2026-06-01T23:45:00+08:00",
      "relatedMembers": ["嘉然"],
      "relatedTopics": ["鸣潮"],
      "sentiment": "positive",
      "confidence": "medium"
    }
  ]
}
```

## 七、后续维护规则

以下变化发生时，应优先更新本文件：

- 四个主板块的字段结构调整
- 新增新的抓取对象类型
- 切片筛选阈值变化
- 主题过滤规则变化
- 草稿生成所依赖的核心字段变化
