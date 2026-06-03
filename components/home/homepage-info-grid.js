import Image from "next/image";

import { getAccentClasses } from "../../lib/homepage-presenter";

function SectionFrame({ eyebrow, title, children, className = "" }) {
  return (
    <section
      className={`rounded-[30px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_34px_rgba(86,71,118,0.08)] ${className}`}
    >
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
                {item.imageSrc ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/80 shadow-sm">
                    <Image src={item.imageSrc} alt={item.memberLabel} fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${accent.badge}`}
                  >
                    {item.memberName.slice(0, 1)}
                  </div>
                )}
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
          <p className="mt-2 text-sm leading-7 text-[#5F5976]">
            先把当天要播什么排清楚，再补摘要、数据和反馈，日报的阅读感会比直接堆信息更好。
          </p>
        </div>
      </SectionFrame>

      <SectionFrame eyebrow="SCHEDULE" title="直播日程">
        <div className="grid gap-3">
          {scheduleRows.map((row) => {
            const accent = getAccentClasses(row.accent);

            return (
              <article
                key={row.id}
                className="group relative overflow-hidden rounded-[26px] border border-[#ECE2FB] bg-[linear-gradient(135deg,rgba(255,250,253,0.96),rgba(245,247,255,0.92))] p-4 shadow-[0_14px_28px_rgba(91,73,129,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_34px_rgba(91,73,129,0.1)]"
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(180deg,#F8B6C8,#B9A7F5,#A8D8FF)] opacity-80" />
                <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#2B243A] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-white">
                        {row.time}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${accent.badge}`}>
                        {row.member}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black leading-7 text-[#282438]">{row.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-[#6F6888]">{row.highlights}</p>
                    </div>
                  </div>
                  <div className="min-w-[92px] rounded-[20px] border border-white/80 bg-white/70 px-3 py-2 text-right shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A08FBE]">Digest</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#5B5571]">
                      {row.shortNote || "等待更多补充"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="rounded-[24px] border border-dashed border-[#D9D0F6] bg-[linear-gradient(135deg,#FFF7FB,#F5F7FF)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8E84AA]">Schedule Note</p>
            <p className="mt-2 text-sm leading-7 text-[#5F5976]">
              当前日程优先来自每日抓取的直播表，后续还会继续叠加改期合并、官号动态和直播间状态校验。
            </p>
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-lg text-[#7D6DB3]">
                    {card.icon}
                  </div>
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
