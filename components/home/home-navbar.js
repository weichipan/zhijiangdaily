export default function HomeNavbar({ dateCard }) {
  const navItems = [
    ["首页", "#home"],
    ["日报", "#recent-reports"],
    ["数据", "#info-grid"],
    ["反馈", "#feedback"],
    ["档案", "#archive"],
  ];

  return (
    <header className="sticky top-4 z-30 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_18px_40px_rgba(84,67,112,0.12)] backdrop-blur md:px-6">
      <a href="#home" className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#E9DDFB] bg-[linear-gradient(145deg,#FFF6FA,#F2EDFF)] text-xl text-[#8A71D8] shadow-[0_10px_18px_rgba(185,167,245,0.18)]">
          ✦
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8E84AA]">ZHIJIANG DAILY</p>
          <p className="truncate text-lg font-black text-[#282438] md:text-[22px]">枝江日报</p>
        </div>
      </a>

      <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
        {navItems.map(([label, href], index) => (
          <a
            key={label}
            href={href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold text-[#554D6E] transition hover:-translate-y-0.5 hover:shadow-md ${
              index === 0 ? "border-[#EBC4D3] bg-[#FFF1F6]" : "border-[#E4DDF7] bg-[#FDFBFF]"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="shrink-0 rounded-[22px] border border-[#DDD4F7] bg-[linear-gradient(135deg,#FDF7FF,#EEF7FF)] px-4 py-3 text-right shadow-[0_12px_24px_rgba(168,216,255,0.18)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8E84AA]">Daily Card</p>
        <p className="mt-1 text-sm font-bold text-[#282438] md:text-base">{dateCard}</p>
      </div>
    </header>
  );
}
