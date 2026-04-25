import Link from "next/link";
import { redirect } from "next/navigation";

import AdminDashboard from "../../components/admin-dashboard";
import { isAdminAuthenticated } from "../../lib/auth";
import { getTodayDateString } from "../../lib/date";
import { getIssueByDate, getLogs, getSettings, getSources } from "../../lib/repository";
import { defaultIssue } from "../../lib/seed";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const date = getTodayDateString();
  const [issue, sources, settings, logs] = await Promise.all([
    getIssueByDate(date),
    getSources(),
    getSettings(),
    getLogs(),
  ]);

  return (
    <main className="admin-shell">
      <nav className="site-nav">
        <div className="nav-links">
          <Link className="nav-link" href="/">
            返回首页
          </Link>
          <Link className="nav-link" href={`/daily/${date}`}>
            查看今日日报
          </Link>
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="ghost-button">
            退出后台
          </button>
        </form>
      </nav>

      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <p className="panel-index">卷</p>
          <div>
            <h2>后台审核中心</h2>
            <p>执行抓取、生成草稿、编辑文本、配置数据源与 B 站 Cookie。</p>
          </div>
        </div>
      </section>

      <AdminDashboard
        initialData={{
          issue: issue || { ...defaultIssue, date, id: `issue-${date}` },
          sources,
          settings,
          logs: logs.slice(0, 12),
        }}
      />
    </main>
  );
}
