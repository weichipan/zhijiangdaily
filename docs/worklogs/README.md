# 工作日志

这个目录用于保存每天收工后的工作摘要。

## 作用

这里不保存完整对话，而是保存高价值的工作摘要：

- 今天完成了什么
- 影响了哪些文件或模块
- 做出了哪些决策
- 当前还有哪些风险或阻塞
- 下一步建议做什么

## 命名方式

建议一日一文件：

- `YYYY-MM-DD.md`

## 标准结构

每份工作日志建议使用以下标题：

- `## 已完成`
- `## 影响范围`
- `## 决策`
- `## 风险`
- `## 下一步`

## 追加规则

- 同一天的 worklog 默认只追加，不整篇重写
- 多个并行会话同时工作时，也应优先追加到对应小节，而不是覆盖整份日志
- 只有在当天日志内容明显损坏、重复严重或标题结构错误时，才允许人工重整

## 与其他文档的关系

- `docs/context-summary.md`：阶段级滚动摘要
- `docs/worklogs/*.md`：按天记录的工作总结
- `docs/decisions/*.md`：长期有效的关键决策

## 更新规则

- 每个工作日结束前至少补一份 worklog
- 如无特殊说明，优先使用 `scripts/append-worklog-entry.ps1` 追加条目
- 如果当天做了结构性调整，也同步刷新 `docs/context-summary.md`
- 如果当天做了长期影响较大的取舍，新增一条 `docs/decisions/`
- 可运行 `scripts/new-worklog.ps1` 创建当天日志
- 可运行 `scripts/append-worklog-entry.ps1` 追加结构化条目
- 可运行 `scripts/refresh-context-summary.ps1` 刷新阶段摘要中的最近工作块
