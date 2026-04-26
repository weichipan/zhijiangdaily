import Script from "next/script";

import "./globals.css";

export const metadata = {
  title: "枝江日报",
  description: "记录虚拟偶像每日直播、总结、数据与反馈的日报站点",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Script id="tailwind-config" strategy="beforeInteractive">{`
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  cream: '#FFF9F3',
                  blush: '#F8B6C8',
                  lavender: '#B9A7F5',
                  sky: '#A8D8FF',
                  ink: '#282438'
                },
                boxShadow: {
                  paper: '0 24px 60px rgba(72, 58, 101, 0.14)'
                }
              }
            }
          };
        `}</Script>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
