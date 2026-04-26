import Image from "next/image";
import Link from "next/link";

import { getAccentClasses } from "../../lib/homepage-presenter";

function ReportCard({ report }) {
  const accent = getAccentClasses(report.accent);

  return (
    <Link
      href={report.href}
      className={`group relative min-w-[230px] overflow-hidden rounded-[28px] border border-white/80 bg-white/80 p-3 shadow-[0_14px_26px_rgba(82,67,118,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_34px_rgba(82,67,118,0.14)] ${report.rotation}`}
    >
      <div className="absolute -right-3 top-4 h-10 w-16 rotate-[18deg] rounded-lg bg-white/70 shadow-sm" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,#FFF5F9,#F3F7FF)]">
        {report.imageSrc ? (
          <div className="relative h-52">
            <Image src={report.imageSrc} alt={report.memberLabel} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          </div>
        ) : (
          <div className={`h-52 bg-gradient-to-br ${accent.glow}`} />
        )}
      </div>

      <div className="relative space-y-3 px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${accent.badge}`}>RECENT</p>
            <h3 className="mt-3 text-lg font-black text-[#282438]">{report.memberLabel}</h3>
            <p className="mt-1 text-sm font-semibold text-[#6D6684]">{report.reportTitle}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7DFF6] bg-[#FFF6FB] text-lg text-[#7D6DB3] transition group-hover:bg-[#B9A7F5] group-hover:text-white">
            →
          </div>
        </div>
        <p className="text-sm text-[#8A84A0]">{report.date}</p>
      </div>
    </Link>
  );
}

export default function RecentReports({ reports }) {
  return (
    <section id="recent-reports" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8E84AA]">RECENT REPORTS</p>
          <h2 className="mt-2 text-3xl font-black text-[#282438]">最近日报</h2>
        </div>
        <div className="hidden rounded-full border border-[#E8DCF4] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6F6688] md:block">Polaroid archive</div>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-full gap-4 px-1">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}
