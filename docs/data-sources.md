# 数据来源说明

## 用途

这个文件用来说明“日报每天应该从哪里抓取什么内容，以及每类来源的用途是什么”。

这里存放的是给人和 agent 阅读理解的说明。
机器可读的数据源配置放在 [data/source-accounts.json](/E:/zhijiang/data/source-accounts.json)。

## 来源分类

当前项目将数据来源分为四类：

1. 公司与团体官方账号
2. 成员官方账号与直播间
3. 切片员账号与切片观察位
4. 第三方直播数据网站

## 来源与板块映射

### 每日直播日程表

主要来源：

- 成员直播间
- 官方账号动态中的排班或预告内容

### 昨日直播数据

主要来源：

- 成员直播间
- 第三方直播数据网站

### 昨日高播放切片

主要来源：

- 切片员账号
- 平台搜索结果与切片观察位

### 昨日热点总结与反馈

主要来源：

- 公司官方动态
- 团体官方动态
- 成员官方动态
- 切片评论区

## 已确认的官方动态来源

这些是当前已经确认、需要每天追踪的官方动态页。

### 公司

- 枝江娱乐官方账号
  动态页：`https://space.bilibili.com/3493085336046382/dynamic`

### 团体

- A-SOUL 官号
  动态页：`https://space.bilibili.com/703007996/dynamic`

### 成员

- 嘉然
  动态页：`https://space.bilibili.com/672328094/dynamic`
- 乃琳
  动态页：`https://space.bilibili.com/672342685/dynamic`
- 贝拉
  动态页：`https://space.bilibili.com/672353429/dynamic`
- 心宜
  动态页：`https://space.bilibili.com/3537115310721181/dynamic`
- 思诺
  动态页：`https://space.bilibili.com/3537115310721781/dynamic`

## 每条来源建议保留的字段

每条来源记录建议尽量包含以下字段：

- `id`
- `label`
- `type`
- `group`
- `member`
- `platform`
- `url`
- `dynamicUrl`
- `uid`
- `roomId`
- `enabled`
- `purpose`
- `notes`

## 更新规则

当新增链接时：

1. 先更新本文件，补充人类可读说明
2. 再更新 `data/source-accounts.json`，补结构化记录
3. 如果出现了新的来源类型，再同步更新 `docs/architecture.md`

## 当前仍待补充

以下来源目前还需要继续补齐：

- 切片员观察名单
- 第三方直播数据网站
- 如果后续需要，也可补充其他平台或镜像来源
