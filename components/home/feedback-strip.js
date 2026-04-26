import Image from "next/image";

import { getAccentClasses } from "../../lib/homepage-presenter";

export default function FeedbackStrip({ feedbackCards, archive, decorativeImages }) {
  return (
    <section id="feedback" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8E84AA]">FEEDBACK</p>
          <h2 className="mt-2 text-3xl font-black text-[#282438]">直播反馈</h2>
        </div>
        <div id="archive" className="hidden rounded-full border border-[#E8DCF4] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6F6688] md:block">
          收藏今日反响
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {feedbackCards.map((card) => {
          const accent = getAccentClasses(card.accent);
          return (
            <article key={card.id} className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_34px_rgba(86,71,118,0.08)]">
              <div className="absolute right-5 top-4 text-6xl leading-none text-[#EFE8FF]">“</div>
              <div className="relative flex items-center gap-3">
                {card.imageSrc ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/80 shadow-sm">
                    <Image src={card.imageSrc} alt={card.memberLabel} fill className="object-cover" />
                  </div>
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${accent.badge}`}>
                    {card.memberName.slice(0, 1)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#282438]">{card.memberLabel}</p>
                  <p className="text-sm text-[#8A84A0]">Live feedback memo</p>
                </div>
              </div>
              <p className="relative mt-4 text-sm leading-7 text-[#5E5974]">{card.text}</p>
            </article>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/72 p-5 shadow-[0_18px_34px_rgba(86,71,118,0.08)]">
        {decorativeImages?.feedback ? (
          <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
            <Image src={decorativeImages.feedback} alt="" fill className="object-cover" />
          </div>
        ) : null}
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8E84AA]">ARCHIVE</p>
            <h3 className="mt-2 text-2xl font-black text-[#282438]">日报档案</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {archive.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-full border border-[#E6DDF6] bg-[#FCFAFF] px-4 py-2 text-sm font-semibold text-[#5F5878] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {item.date}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
