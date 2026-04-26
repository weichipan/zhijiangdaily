import { getAccentClasses } from "../../lib/homepage-presenter";

function SectionFrame({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`rounded-[30px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_34px_rgba(86,71,118,0.08)] ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9A90B8]">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-black text-[#282438]">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function HomepageInfoGrid({ headlines, scheduleRows, summaryCards }) {
  return (
    <section id="info-grid" className="grid gap-5 lg:grid-cols-[0.92fr_1.38fr_0.9fr]">
      <SectionFrame eyebrow="HEADLINES" title="今日要闻">
        <div className="space-y-3">
          {headlines.map((item) => {
            const accent = getAccentClasses(item.accent);
            return (
              <div key={item.id} className="flex gap-3 rounded-[24px] border border-[#EFE7FA] bg-[#FFFDFF] p-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${accent.badge}`}>
                  {item.memberName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#282438]">{item.memberLabel}</h4>
                    <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#6C6583]">{item.status}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-[24px] border border-dashed border-[#D9D0F6] bg-[linear-gradient(135deg,#FFF8FB,#F6F8FF)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8E84AA]">Little Tip</p>
          <p className="mt-2 text-sm leading-7 text-[#5F5976]">今天的小贴士：先看成员动态和直播预告，再整理成时间线，会比直接堆数据更像一份好读的日报。</p>
        </div>
      </SectionFrame>

      <SectionFrame eyebrow="SCHEDULE" title="直播日程">
        <div className="overflow-hidden rounded-[24px] border border-[#EDE4FB] bg-[#FFFDFE]">
          <div className="hidden grid-cols-[88px_92px_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#F2EAFB] bg-[linear-gradient(135deg,#FFF4F8,#F5F1FF)] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8A79B6] md:grid">
            <span>时间</span>
            <span>成员</span>
            <span>直播主题</span>
            <span>看点</span>
          </div>
          <div className="divide-y divide-[#F5EFFB]">
            {scheduleRows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm text-[#5A556F] md:grid-cols-[88px_92px_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="font-semibold text-[#7A6EA2]">{row.time}</div>
                <div className="font-bold text-[#282438]">{row.member}</div>
                <div className="leading-6">{row.title}</div>
                <div className="leading-6 text-[#7A7591]">{row.highlights}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionFrame>

      <SectionFrame eyebrow="SUMMARY" title="今日总结">
        <div className="grid gap-3">
          {summaryCards.map((card) => {
            const accent = getAccentClasses(card.accent);
            return (
              <div key={card.id} className={`rounded-[26px] border p-4 shadow-sm ${accent.badge}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#625D79]">{card.label}</p>
                    <p className="mt-2 text-4xl font-black text-[#282438]">{card.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-lg text-[#7D6DB3]">{card.icon}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#6F6888]">{card.note}</p>
              </div>
            );
          })}
        </div>
      </SectionFrame>
    </section>
  );
}
