# Architecture

## 顶层目录

- `app/`：Next.js App Router 页面和 API
- `components/`：客户端交互组件
- `lib/`：抓取、草稿生成、存储、查询、鉴权
- `data/`：本地开发模式下的 JSON 数据
- `public/`：前端静态资源
- `docs/`：长期上下文、决策和阶段总结

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

`lib/repository.js` 继续作为统一的数据访问层，上层页面和 API 不直接感知底层存储介质。

## 数据流

1. 后台触发抓取
2. 抓取结果进入 `rawItems`
3. 草稿生成器把原料整理为日报结构
4. 审核后的日报写入 `issues`
5. 前台读取最新一期或指定日期日报进行展示

## 适配 Vercel 的注意点

- 页面显式设置为动态渲染，避免把日报内容错误缓存成静态结果
- 后台鉴权 Cookie 在生产环境下启用 `secure`
- 不再依赖部署实例的本地文件系统持久化
