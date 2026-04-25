import "./globals.css";

export const metadata = {
  title: "枝江日报",
  description: "A-SOUL 每日直播日程、总结、数据与反馈站点",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
