import FeedbackStrip from "../components/home/feedback-strip";
import HeroBanner from "../components/home/hero-banner";
import HomepageInfoGrid from "../components/home/homepage-info-grid";
import HomeNavbar from "../components/home/home-navbar";
import RecentReports from "../components/home/recent-reports";
import { getTodayDateString } from "../lib/date";
import { buildHomepageView } from "../lib/homepage-presenter";
import { getDailyImageSet } from "../lib/image-library";
import { getHomepageData } from "../lib/queries";

export const dynamic = "force-dynamic";

function formatDateCard(date = new Date()) {
  const weekday = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "long",
  }).format(date);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}/${values.month}/${values.day} ${weekday}`;
}

export default async function HomePage() {
  const homepageData = await getHomepageData();
  const todayDate = getTodayDateString();
  const view = buildHomepageView({
    ...homepageData,
    imageSet: getDailyImageSet(todayDate),
    todayDateCard: formatDateCard(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFF8F5_0%,#FFF7FB_40%,#F4F0FF_72%,#EFF7FF_100%)] px-3 py-4 text-[#282438] md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        <HomeNavbar dateCard={view.nav.dateCard} />

        <div className="relative overflow-hidden rounded-[42px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.78))] p-3 shadow-[0_35px_80px_rgba(94,77,133,0.14)] md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,182,200,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(185,167,245,0.16),transparent_24%),linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px]" />

          <div className="relative flex flex-col gap-5">
            <HeroBanner hero={view.hero} />
            <RecentReports reports={view.recentReports} />
            <HomepageInfoGrid headlines={view.headlines} scheduleRows={view.scheduleRows} summaryCards={view.summaryCards} />
            <FeedbackStrip feedbackCards={view.feedbackCards} archive={view.archive} decorativeImages={view.decorativeImages} />
          </div>
        </div>
      </div>
    </main>
  );
}
