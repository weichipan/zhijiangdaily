export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const params = (await searchParams) || {};
  const error = params.error;

  return (
    <main className="login-wrap">
      <section className="login-card">
        <p className="eyebrow" style={{ color: "#b54a68" }}>
          枝江日报后台
        </p>
        <h2>登录审核中心</h2>
        <p className="muted">首版默认使用环境变量 `ADMIN_PASSWORD` 登录，未配置时使用默认密码。</p>
        {error ? <div className="message error">密码错误，请重试。</div> : null}
        <form action="/api/auth/login" method="post">
          <input type="hidden" name="redirect" value={params.redirect || "/admin"} />
          <label className="field">
            <span>后台密码</span>
            <input type="password" name="password" placeholder="请输入后台密码" />
          </label>
          <button type="submit" className="button">
            登录
          </button>
        </form>
      </section>
    </main>
  );
}
