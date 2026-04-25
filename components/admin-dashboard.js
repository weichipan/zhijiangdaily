"use client";

import { useState } from "react";

export default function AdminDashboard({ initialData }) {
  const [issue, setIssue] = useState(initialData.issue);
  const [sources, setSources] = useState(JSON.stringify(initialData.sources, null, 2));
  const [cookieValue, setCookieValue] = useState(initialData.settings.bilibiliCookie || "");
  const [crawlDate, setCrawlDate] = useState(initialData.issue.date);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleText, setScheduleText] = useState(JSON.stringify(initialData.issue.schedule, null, 2));
  const [summaryText, setSummaryText] = useState(JSON.stringify(initialData.issue.summaries, null, 2));
  const [metricsText, setMetricsText] = useState(JSON.stringify(initialData.issue.metrics, null, 2));
  const [feedbackText, setFeedbackText] = useState(JSON.stringify(initialData.issue.feedback, null, 2));

  async function request(url, options = {}) {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setMessage({ type: "success", text: data.message || "操作完成" });
      return data;
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }

  function syncIssueState(nextIssue) {
    setIssue(nextIssue);
    setScheduleText(JSON.stringify(nextIssue.schedule, null, 2));
    setSummaryText(JSON.stringify(nextIssue.summaries, null, 2));
    setMetricsText(JSON.stringify(nextIssue.metrics, null, 2));
    setFeedbackText(JSON.stringify(nextIssue.feedback, null, 2));
  }

  async function handleRunCrawl() {
    const data = await request("/api/crawl/run-daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: crawlDate }),
    });

    if (data?.issue) {
      syncIssueState(data.issue);
    }
  }

  async function handleGenerateDraft() {
    const data = await request("/api/draft/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: crawlDate }),
    });

    if (data?.issue) {
      syncIssueState(data.issue);
    }
  }

  async function handlePublish() {
    const data = await request(`/api/daily/${issue.date}/publish`, {
      method: "POST",
    });

    if (data?.issue) {
      syncIssueState(data.issue);
    }
  }

  async function handleSaveIssue() {
    const payload = {
      ...issue,
      schedule: JSON.parse(scheduleText),
      summaries: JSON.parse(summaryText),
      metrics: JSON.parse(metricsText),
      feedback: JSON.parse(feedbackText),
    };

    const data = await request(`/api/daily/${issue.date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (data?.issue) {
      syncIssueState(data.issue);
    }
  }

  async function handleSaveSources() {
    await request("/api/source-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: sources,
    });
  }

  async function handleSaveCookie() {
    await request("/api/bilibili-cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bilibiliCookie: cookieValue }),
    });
  }

  return (
    <div className="admin-grid">
      <div className="admin-card">
        <div className="admin-topbar">
          <div>
            <h3>今日待审核日报</h3>
            <p className="muted">当前日期：{issue.date}</p>
          </div>
          <div className="toolbar-group">
            <span className="dashboard-chip">状态：{issue.status}</span>
            <span className="dashboard-chip">更新于：{issue.updatedAt}</span>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <input type="date" value={crawlDate} onChange={(event) => setCrawlDate(event.target.value)} />
            <button type="button" className="ghost-button" onClick={handleRunCrawl} disabled={loading}>
              执行日抓取
            </button>
            <button type="button" className="ghost-button" onClick={handleGenerateDraft} disabled={loading}>
              重新生成草稿
            </button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="ghost-button" onClick={handleSaveIssue} disabled={loading}>
              保存编辑
            </button>
            <button type="button" className="button" onClick={handlePublish} disabled={loading}>
              发布当天日报
            </button>
          </div>
        </div>

        {message ? <div className={`message ${message.type}`}>{message.text}</div> : null}

        <div className="form-stack" style={{ marginTop: 16 }}>
          <label className="field">
            <span>日报标题</span>
            <input
              value={issue.headline}
              onChange={(event) => setIssue((current) => ({ ...current, headline: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>日报导语</span>
            <textarea
              value={issue.summary}
              onChange={(event) => setIssue((current) => ({ ...current, summary: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>今日直播日程表 JSON</span>
            <textarea value={scheduleText} onChange={(event) => setScheduleText(event.target.value)} className="mono" />
          </label>
          <label className="field">
            <span>今日直播总结 JSON</span>
            <textarea value={summaryText} onChange={(event) => setSummaryText(event.target.value)} className="mono" />
          </label>
          <label className="field">
            <span>直播数据分析 JSON</span>
            <textarea value={metricsText} onChange={(event) => setMetricsText(event.target.value)} className="mono" />
          </label>
          <label className="field">
            <span>直播反馈 JSON</span>
            <textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} className="mono" />
          </label>
        </div>
      </div>

      <div className="split-2">
        <div className="admin-card">
          <h3>数据源账号列表</h3>
          <p className="muted">支持官方账号、成员直播间、切片观察位。直接编辑 JSON 保存。</p>
          <div className="form-stack">
            <label className="field">
              <span>来源配置 JSON</span>
              <textarea value={sources} onChange={(event) => setSources(event.target.value)} className="mono" />
            </label>
            <button type="button" className="ghost-button" onClick={handleSaveSources} disabled={loading}>
              保存来源配置
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3>配置 B 站 Cookie</h3>
          <p className="muted">首版会先用公开接口抓取；需要登录态时，把采集号 Cookie 粘贴到这里即可。</p>
          <div className="form-stack">
            <label className="field">
              <span>SESSDATA / 完整 Cookie</span>
              <textarea value={cookieValue} onChange={(event) => setCookieValue(event.target.value)} className="mono" />
            </label>
            <button type="button" className="ghost-button" onClick={handleSaveCookie} disabled={loading}>
              保存 Cookie
            </button>
          </div>
        </div>
      </div>

      <div className="split-2">
        <div className="admin-card">
          <h3>采集日志</h3>
          <div className="history-list">
            {initialData.logs.map((log) => (
              <div className="log-item" key={log.id}>
                <strong>{log.message}</strong>
                <span className="muted">
                  {log.createdAt} · {log.type} · {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3>接口清单</h3>
          <ul className="summary-list">
            <li>`POST /api/crawl/run-daily`</li>
            <li>`POST /api/draft/generate`</li>
            <li>`GET /api/daily/:date`</li>
            <li>`POST /api/daily/:date/publish`</li>
            <li>`POST /api/source-accounts`</li>
            <li>`POST /api/bilibili-cookie`</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
