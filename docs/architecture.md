# Architecture

## 顶层目录

- `app/`：Next.js App Router 页面和 API
- `components/`：客户端交互组件
- `lib/`：抓取、草稿生成、存储、查询、鉴权
- `data/`：本地开发模式下的 JSON 数据
- `public/`：前端静态资源
- `docs/`：长期上下文、决策和阶段总结
- `docs/data-models.md`：抓取结果、草稿生成与存储共用的数据字段模型
- `docs/filter-rules.md`：切片、搜索结果与热点来源共用的主题过滤规则
- `docs/crawl-output-format.md`：抓取器应输出的统一结构与过滤结果字段

## 路由层

- `app/page.js`：首页，展示最新一期日报与历史归档
- `app/daily/[date]/page.js`：单日详情页
- `app/admin/page.js`：后台审核页
- `app/admin/login/page.js`：后台登录页

## API 层

- `app/api/auth/*`：登录和退出
- `app/api/source-accounts/route.js`：数据源配置读写
- `app/api/bilibili-cookie/route.js`：B 站 Cookie 保存
- `app/api/crawl/run-daily/route.js`：抓取并生成当日草稿
- `app/api/crawl/run-clips/route.js`：运行切片候选抓取骨架并输出过滤结果
- `app/api/crawl/run-schedule/route.js`：支持手动 `POST` 抓取日程，也支持 Vercel Cron 通过 `GET` 定时抓取
- `app/api/draft/generate/route.js`：按原料重生成草稿
- `app/api/daily/[date]/route.js`：日报读取与保存
- `app/api/daily/[date]/publish/route.js`：发布日报

## 存储层

`lib/storage.js` 现在支持两种运行模式：

1. `local-json`
   - 默认用于本地开发
   - 直接读写 `data/*.json`

2. `vercel-kv`
   - 当存在 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 时启用
   - 用 Vercel KV 保存来源配置、Cookie、原料、日报、日志

3. `upstash-redis`
   - 当存在 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 时优先启用
   - 这是当前更推荐的线上持久化方式
   - 用 Upstash Redis REST 保存来源配置、Cookie、原料、日报、日志

当前优先级为：
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- 都没有时回落到 `local-json`

`lib/repository.js` 继续作为统一的数据访问层，上层页面和 API 不直接感知底层存储介质。

## 数据流

1. 后台触发抓取
2. 抓取结果进入 `rawItems`
3. 切片候选抓取骨架把视频候选整理到 `clipCandidates`
4. 草稿生成器把原料整理为日报结构
5. 审核后的日报写入 `issues`
6. 前台读取最新一期或指定日期日报进行展示

字段模型以 [docs/data-models.md](/E:/zhijiang/docs/data-models.md) 为准，抓取输出、草稿生成输入和后台编辑结构应尽量围绕这份定义收敛。
主题相关性判断以 [docs/filter-rules.md](/E:/zhijiang/docs/filter-rules.md) 为准，切片过滤、候选排序和热点来源筛选应共用这份规则。
抓取器输出结构以 [docs/crawl-output-format.md](/E:/zhijiang/docs/crawl-output-format.md) 为准，后续实现时优先围绕这份定义收敛。

## 适配 Vercel 的注意点

- 页面显式设置为动态渲染，避免把日报内容错误缓存成静态结果
- 后台鉴权 Cookie 在生产环境下启用 `secure`
- 不再依赖部署实例的本地文件系统持久化

## 素材库约定

- 网站图片素材统一存放在 `public/images/`
- 团体合照按团体分目录维护：
  - `public/images/asoul/`
  - `public/images/小心思/`
- 成员单人图按成员分目录维护：
  - `public/images/嘉然/`
  - `public/images/乃琳/`
  - `public/images/贝拉/`
  - `public/images/心宜/`
  - `public/images/思诺/`
- 后续新增图片时，直接放入对应目录即可，不需要手动改页面路径

## 素材选择规则

- 首页和日报详情页的图片由 `lib/image-library.js` 统一读取和选择
- 每个成员相关卡片优先从对应成员目录中取单人图
- 非成员专属区域优先从团体合照目录中取图
- 选图按“日期 + 位置”做稳定随机：
  - 同一天内页面展示保持一致
  - 到新的一天后会自动换一套素材
- 如果某个成员目录暂时没有图片，页面退回到原有渐变占位

## 2026-06-04 补充：日程抓取链路

- 新增接口：`app/api/crawl/run-schedule/route.js`
- 新增抓取器：`lib/schedule-crawler.js`
- 新增存储：`scheduleItems` -> `data/schedule-items.json`

当前第一版日程抓取约定如下：

- 从 `https://asoul.love/` 首页内嵌的 `FilterableCalendar.initialEvents` 直接提取周表事件
- 不依赖前端交互，不额外模拟翻页，先以稳定拿到结构化周表为目标
- 抓取结果会映射到统一的 `scheduleItems` 字段模型
- 目标日期过滤在抓取器内完成，便于后续直接按日报日期消费

当前自动化约定如下：

- 使用 `vercel.json` 中的 `crons` 配置定时任务
- 当前配置为 `0 0 * * *`
- 这对应 **Asia/Shanghai 每天 08:00**
- Cron 触发入口为 `GET /api/crawl/run-schedule`
- 该入口要求 `Authorization: Bearer ${CRON_SECRET}`，避免被外部随意调用

当前 host 对照关系：

- `diana` -> `嘉然`
- `eileen` -> `乃琳`
- `bella` -> `贝拉`
- `fiona` -> `心宜`
- `gladys` -> `思诺`

当前状态映射规则：

- `published` -> `scheduled`
- `rescheduled` -> `scheduled`
- `cancelled` -> `cancelled`

站点的原始状态、回放、改期来源等信息，暂时保留在 `rawPayload` 和 `notes` 中，后续再决定如何并入日报草稿生成。
