import { notFound } from "next/navigation";

import { formatIssueDate } from "../../../lib/date";
import { getDailyImageSet } from "../../../lib/image-library";
import { getIssueByDate } from "../../../lib/repository";

export const dynamic = "force-dynamic";

function buildLayeredBackground(imageSrc) {
  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: [
      "linear-gradient(90deg, rgba(25, 17, 23, 0.84), rgba(25, 17, 23, 0.34) 42%, rgba(25, 17, 23, 0.8))",
      "linear-gradient(180deg, rgba(18, 13, 18, 0.22), rgba(18, 13, 18, 0.64))",
      `url("${imageSrc}")`,
    ].join(", "),
    backgroundPosition: "center, center, center 22%",
    backgroundSize: "auto, auto, cover",
    backgroundRepeat: "repeat, repeat, no-repeat",
  };
}

function buildFeedbackBackground(imageSrc) {
  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: [
      "linear-gradient(180deg, rgba(27, 16, 23, 0.22), rgba(27, 16, 23, 0.72))",
      `url("${imageSrc}")`,
    ].join(", "),
    backgroundPosition: "center, center 18%",
    backgroundSize: "auto, cover",
    backgroundRepeat: "repeat, no-repeat",
  };
}

export default async function DailyIssuePage({ params }) {
  const { date } = await params;
  const issue = await getIssueByDate(date);

  if (!issue) {
    notFound();
  }

  const imageSet = getDailyImageSet(issue.date);
  const heroImage = imageSet.groups.hero ?? imageSet.groups.asoul ?? imageSet.groups.xiaoxinsi ?? null;
  const feedbackImage = imageSet.groups.feedback ?? imageSet.groups.xiaoxinsi ?? imageSet.groups.asoul ?? null;
  const tags = [...new Set(issue.schedule.map((item) => item.member).filter(Boolean))].slice(0, 5);

  return (
    <main className="site-shell">
      <nav className="site-nav">
        <div className="nav-links">
          <a className="nav-link" href="#schedule">
            日程
          </a>
          <a className="nav-link" href="#summary">
            总结
          </a>
          <a className="nav-link" href="#metrics">
            数据
          </a>
          <a className="nav-link" href="#feedback">
            反馈
          </a>
        </div>
        <a className="button" href="/admin">
          后台审核
        </a>
      </nav>

      <section className="hero">
        <div className="hero-backdrop" style={buildLayeredBackground(heroImage)} />
        <div className="hero-content">
          <div className="hero-topline">
            <span className="brand-pill">枝江日报</span>
            <span className="hero-edition">{issue.status === "published" ? "已发布" : "草稿"}</span>
          </div>
          <div className="hero-grid">
            <div className="headline-stack">
              <p className="eyebrow">{formatIssueDate(issue.date)}</p>
              <h1>{issue.headline}</h1>
              <p className="hero-copy">{issue.summary}</p>
            </div>
            <aside className="hero-card">
              <p>发布日期</p>
              <p className="date">{issue.publishedAt ? issue.publishedAt.slice(0, 10) : "未发布"}</p>
              <div className="tag-list">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="tag">待补充成员</span>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="schedule" className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <p className="panel-index">01</p>
          <div>
            <h2>今日直播日程</h2>
            <p>优先使用每日抓取的直播表，再由后台做最终审核与修订。</p>
          </div>
        </div>
        <div className="schedule-feature-grid">
          {issue.schedule.map((item) => (
            <article className="schedule-feature-card" key={item.id}>
              <div className="schedule-feature-top">
                <span className="schedule-time-pill">{item.time}</span>
                <span className="schedule-member-pill">{item.member}</span>
              </div>
              <h3 className="schedule-feature-title">{item.title}</h3>
              <p className="schedule-feature-copy">{item.highlights}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="summary" className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <p className="panel-index">02</p>
          <div>
            <h2>今日直播总结</h2>
            <p>默认由系统起草，再经后台审核。</p>
          </div>
        </div>
        <div className="cards-3">
          {issue.summaries.map((item) => (
            <article className="sub-card" key={item.id}>
              <h3>{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="metrics" className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <p className="panel-index">03</p>
          <div>
            <h2>直播数据分析</h2>
            <p>展示当前草稿所依赖的客观指标。</p>
          </div>
        </div>
        <ul className="metrics-list">
          {issue.metrics.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <p className="metric-note">{item.note}</p>
              </div>
              <span className="metric-value">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="feedback"
        className="panel feedback-card"
        style={{ marginTop: 18, ...buildFeedbackBackground(feedbackImage) }}
      >
        <div className="panel-head">
          <p className="panel-index">04</p>
          <div>
            <h2>直播反馈</h2>
            <p style={{ color: "rgba(255,247,242,0.88)" }}>热词、评论和弹幕观察位。</p>
          </div>
        </div>
        <div className="feedback-list">
          {issue.feedback.map((item) => (
            <div className="feedback-item" key={item.id}>
              {item.text}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
