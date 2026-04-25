# AGENTS

这个文件记录本项目里适合长期保留的人机协作约定。

## 协作原则

- 先读 `README.md`、`docs/project-direction.md`、`docs/architecture.md`
- 优先做小步、可验证、可回滚的改动
- 不把长期约定只留在对话里，落到仓库文档
- 涉及范围、数据结构、发布流程变化时，先更新文档再扩展实现

## 目录边界

- `app/`：页面和路由层，尽量薄
- `components/`：UI 与交互
- `lib/`：核心业务逻辑与数据访问
- `data/`：运行数据，不把其当作设计文档来源
- `public/`：前端静态资源的唯一权威位置
- `docs/`：长期上下文、方向、决策和总结
- `tools/`：本地依赖工具，不随意删改

## 改动约定

- 新增长期约定时，同时更新对应文档
- 做结构性修改时，补 `docs/context-summary.md`
- 做关键取舍时，在 `docs/decisions/` 新增一条决策记录
- 删除文件前先确认它是生成产物、重复资源或无引用文件

## 上下文维护

- `README.md`：项目入口和新人导航
- `docs/project-direction.md`：目标、范围、优先级
- `docs/architecture.md`：系统结构和职责边界
- `docs/context-summary.md`：阶段状态、卡点、下一步
- `docs/decisions/`：重要设计和技术决策
- `docs/worklogs/*.md`：每日工作总结

## Worklog 规则

- 同一天的 `docs/worklogs/YYYY-MM-DD.md` 默认采用追加式维护
- 多个并行会话同时工作时，不整篇重写当天日志
- 日志更新优先追加到既有小节，必要时使用 `scripts/append-worklog-entry.ps1`

## 当前特别说明

- 项目当前不在一个标准 Git 工作树内，文件整理以“仓库可读性和可协作性”为主
- `tools/git/` 和 `scripts/` 是为工作区环境准备的，保留
- `.next/` 属于构建产物，可删除后重新生成
