import Link from "next/link";

import { formatIssueDate } from "../lib/date";
import { getHomepageData } from "../lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { latestIssue, history, todayLabel } = await getHomepageData();

  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-backdrop" />
        <div className="hero-content">
          <div className="hero-topline">
            <span className="brand-pill">ZHIJIANG DAILY</span>
            <span className="hero-edition">A-SOUL 三人版日报站</span>
          </div>
          <div className="hero-grid">
            <div className="headline-stack">
              <p className="eyebrow">Bilibili A-SOUL 每日直播编排观察</p>
              <h1>枝江日报</h1>
              <p className="hero-copy">
                面向手机、平板和桌面的 A-SOUL 日报网站。系统会按日抓取直播原料，生成待审核草稿，再由后台人工发布成正式日报。
              </p>
            </div>
            <aside className="hero-card">
              <p>今日刊号</p>
              <p className="date">{todayLabel}</p>
              <div className="tag-list">
                <span className="tag">日程</span>
                <span className="tag">总结</span>
                <span className="tag">数据</span>
                <span className="tag">反馈</span>
              </div>
            </aside>
          </div>

          <div className="hero-stats">
            {[
              ["嘉然 Diana", "综艺节奏"],
              ["乃琳 Eileen", "夜谈氛围"],
              ["贝拉 Bella", "舞台张力"],
            ].map(([label, title]) => (
              <article className="stat-card" key={label}>
                <div className="stat-inner">
                  <p>{label}</p>
                  <strong>{title}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <nav className="site-nav">
        <div className="nav-links">
          <a className="nav-link" href="#issue">
            最新日报
          </a>
          <a className="nav-link" href="#history">
            往期归档
          </a>
          <Link className="nav-link" href="/admin">
            后台审核
          </Link>
        </div>
        {latestIssue ? (
          <Link className="button" href={`/daily/${latestIssue.date}`}>
            打开 {latestIssue.date}
          </Link>
        ) : (
          <Link className="button" href="/admin">
            进入后台生成首刊
          </Link>
        )}
      </nav>

      {latestIssue ? (
        <section id="issue" className="daily-grid">
          <article className="panel">
            <div className="panel-head">
              <p className="panel-index">导</p>
              <div>
                <h2>{latestIssue.headline}</h2>
                <p>{latestIssue.summary}</p>
              </div>
            </div>
            <p className="section-note">
              当前展示的是 {formatIssueDate(latestIssue.date)} 的
              {latestIssue.status === "published" ? "已发布日报" : "后台草稿"}。
            </p>
          </article>

          <div className="cards-3">
            {latestIssue.metrics.map((item) => (
              <article className="sub-card" key={item.id}>
                <h3>{item.label}</h3>
                <p className="metric-value serif">{item.value}</p>
                <p className="metric-note">{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel empty-state">
          <div className="art" />
          <div>
            <h2>当天暂无已发布日报</h2>
            <p className="muted">后台可以先执行抓取并生成草稿，审核后再发布到前台。</p>
          </div>
        </section>
      )}

      <section id="history" className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <p className="panel-index">卷</p>
          <div>
            <h2>往期归档</h2>
            <p>支持按日期回看已生成日报。</p>
          </div>
        </div>
        <div className="history-list">
          {history.map((issue) => (
            <Link className="history-item" key={issue.id} href={`/daily/${issue.date}`}>
              <strong>{issue.headline}</strong>
              <span className="muted">
                {issue.date} · {issue.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
