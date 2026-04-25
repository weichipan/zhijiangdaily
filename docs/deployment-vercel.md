# Vercel 上线说明

## 当前结论

当前项目已经通过生产构建验证，可以作为第一版直接部署到 Vercel。

第一版上线策略：

- 先使用当前 localhost 草稿内容上线
- 先保证站点、页面和后台可访问
- 域名绑定到 `zhijiangdaily.com`
- 自动抓取和定时更新放到上线后下一阶段完善

## 当前已确认的技术状态

- 项目可成功执行 `next build`
- 当前存储层支持两种模式：
  - 本地开发：`data/*.json`
  - 线上部署：`KV_REST_API_URL` + `KV_REST_API_TOKEN`
- 如果未配置 KV，项目会回退到本地 JSON 模式

## 推荐上线方式

最稳妥的路径是：

1. 把项目推到 Git 仓库
2. 在 Vercel 中导入该仓库
3. 配置环境变量
4. 完成首次部署
5. 在项目里添加并验证 `zhijiangdaily.com`

## Vercel 环境变量

第一版至少需要：

- `ADMIN_PASSWORD`

如果要在线上持久化后台数据，建议同时配置：

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## 域名绑定

根据 Vercel 官方文档，给项目添加自定义域名时：

- Apex 域名（如 `zhijiangdaily.com`）通常需要配置 `A` 记录
- 子域名（如 `www.zhijiangdaily.com`）通常需要配置 `CNAME` 记录

当前推荐绑定方式：

- 主域名：`zhijiangdaily.com`
- 可选附加：`www.zhijiangdaily.com`

## 常见 DNS 配置

根据 Vercel 官方文档当前说明：

- `zhijiangdaily.com` 可指向 `A 76.76.21.21`
- `www.zhijiangdaily.com` 可指向 `CNAME cname.vercel-dns-0.com`

注意：

- 最终应以 Vercel 项目域名页面给出的记录为准
- 如果域名已被其他服务占用，Vercel 可能要求额外的 TXT 验证

## 在 Vercel 控制台中的操作顺序

1. 创建或导入项目
2. 等首次部署成功
3. 打开项目 `Settings -> Domains`
4. 添加 `zhijiangdaily.com`
5. 如果需要，同时添加 `www.zhijiangdaily.com`
6. 按页面提示去域名注册商处添加 DNS 记录
7. 等待域名验证完成

## 第一版上线后要立即检查的内容

- 首页是否能正常打开
- 单期日报页是否能正常打开
- `/admin/login` 是否可访问
- 登录后后台是否能打开
- 静态图片是否正常加载
- 页面中文是否出现乱码

## 当前阻塞点

代码层面阻塞已经基本排除，当前主要阻塞在账号侧：

- 需要 Vercel 项目实际创建成功
- 需要你在域名注册商处配置 DNS
- 如果要用线上可写数据，需要创建并接入 Vercel KV

## 下一步建议

1. 先把项目导入 Vercel 并完成第一次部署
2. 立即绑定 `zhijiangdaily.com`
3. 确认线上页面能打开
4. 再补 KV 和定时更新
