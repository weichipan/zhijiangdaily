import Image from "next/image";

function IdolTile({ member }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-2 shadow-[0_12px_24px_rgba(78,63,112,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(78,63,112,0.12)]">
      <div className="relative h-24 overflow-hidden rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,#FFF6FB,#EEF5FF)] md:h-32">
        {member.imageSrc ? (
          <Image src={member.imageSrc} alt={member.label ?? member.memberLabel} fill className="object-cover transition duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFF7FA,#EEF6FF)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(40,36,56,0.15))]" />
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <p className="font-bold text-[#282438]">{member.memberName}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${member.accent === "pink" ? "bg-[#F8B6C8]" : member.accent === "purple" ? "bg-[#B9A7F5]" : member.accent === "blue" ? "bg-[#A8D8FF]" : member.accent === "mint" ? "bg-[#9EE3D4]" : "bg-[#FFD88B]"}`} />
      </div>
    </div>
  );
}

export default function HeroBanner({ hero }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden rounded-[38px] border border-[#DCCFFF] bg-[linear-gradient(135deg,#FFF8FB_0%,#F6F1FF_55%,#F4FAFF_100%)] px-6 py-7 shadow-[0_28px_70px_rgba(112,93,166,0.15)] md:px-8 md:py-8"
    >
      {hero.backgroundImageSrc ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
          <Image src={hero.backgroundImageSrc} alt="" fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,182,200,0.28),transparent_32%),radial-gradient(circle_at_top_right,rgba(185,167,245,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,216,255,0.2),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        <span className="absolute left-[8%] top-[12%] text-xl text-[#B9A7F5]">✦</span>
        <span className="absolute right-[12%] top-[18%] text-2xl text-[#F8B6C8]">♥</span>
        <span className="absolute bottom-[16%] left-[46%] text-lg text-[#A8D8FF]">♫</span>
        <span className="absolute bottom-[22%] right-[7%] text-xl text-[#B9A7F5]">✦</span>
      </div>

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E9DDFB] bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7D6DB3] shadow-sm">
              <span className="text-sm">✦</span>
              {hero.tagline}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A07CC0]">{hero.badge}</p>
              <h2 className="max-w-[10ch] text-4xl font-black leading-[0.98] text-[#282438] md:text-6xl">{hero.title}</h2>
              <p className="max-w-xl text-base leading-8 text-[#5C5870] md:text-lg">{hero.copy}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-[24px] border border-[#F0D5DF] bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B989A0]">Current Mood</p>
              <p className="mt-1 text-sm font-semibold text-[#4E4763]">Idol magazine · scrapbook · daily report</p>
            </div>
            <div className="rounded-[24px] border border-[#D9D3F7] bg-white/70 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E84AA]">Today</p>
              <p className="mt-1 text-sm font-semibold text-[#4E4763]">{hero.focusDate}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {hero.members.map((member) => (
            <IdolTile key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
