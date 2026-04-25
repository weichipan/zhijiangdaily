# Zhijiang Daily

枝江日报是一个面向公网的 A-SOUL 日报网站，当前聚焦嘉然、乃琳、贝拉、心宜、思诺五位成员。它包含前台展示、后台审核、抓取草稿生成，以及为 Vercel 部署准备的数据持久化方案。

## 先看哪里

- [AGENTS.md](/E:/zhijiang/AGENTS.md)：协作约定
- [docs/project-direction.md](/E:/zhijiang/docs/project-direction.md)：产品目标和范围
- [docs/architecture.md](/E:/zhijiang/docs/architecture.md)：系统结构和数据流
- [docs/context-summary.md](/E:/zhijiang/docs/context-summary.md)：当前阶段进展

## 当前能力

- 前台首页展示最新一期日报与历史归档
- 单日详情页展示日程、总结、数据分析、直播反馈
- 后台支持登录、抓取、生成草稿、编辑、发布
- 存储层支持两种模式：
  - 本地开发：`data/*.json`
  - Vercel 部署：`KV_REST_API_URL` + `KV_REST_API_TOKEN`

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

默认地址：

- 前台：[http://localhost:3000](http://localhost:3000)
- 后台：[http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 环境变量

- `ADMIN_PASSWORD`：后台登录密码
- `KV_REST_API_URL`：Vercel KV REST 地址
- `KV_REST_API_TOKEN`：Vercel KV REST 令牌

未配置 KV 时，项目会自动回落到本地 JSON 存储。

## 部署到 Vercel

1. 把项目推到 Git 仓库并导入 Vercel
2. 在 Vercel 项目里创建一个 KV 数据库
3. 把 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 配到项目环境变量
4. 配置 `ADMIN_PASSWORD`
5. 触发一次部署

部署后：

- 前台和后台都运行在 Vercel
- 数据不再依赖 `data/*.json`
- 后台编辑、抓取日志、Cookie、日报内容都会写入 KV

## 目录概览

- `app/`：页面、路由、API
- `components/`：交互组件
- `lib/`：业务逻辑、抓取、存储、查询
- `data/`：本地开发模式下的运行数据
- `public/`：静态资源
- `docs/`：长期文档
- `tools/`：工作区内置工具

## 常用命令

- `pnpm dev`
- `pnpm build`
- `pnpm start`

## 工作区 Git

工作区内置了一份 Git，在 [tools/git](/E:/zhijiang/tools/git)。

如果某些工具提示找不到 Git，可以运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\activate-workspace-env.ps1
```
