import { NextResponse } from "next/server";

import { fetchSource } from "../../../../lib/bilibili";
import { getTodayDateString } from "../../../../lib/date";
import { buildDailyDraft } from "../../../../lib/draft";
import { runScheduleCrawler } from "../../../../lib/schedule-crawler";
import {
  addLog,
  appendRawItems,
  appendScheduleItems,
  getIssueByDate,
  getRawItems,
  getScheduleItemsByDate,
  getSettings,
  getSources,
  upsertIssue,
} from "../../../../lib/repository";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();

  try {
    const [sources, settings] = await Promise.all([getSources(), getSettings()]);
    const enabledSources = sources.filter(
      (source) => source.enabled && source.type !== "schedule_site",
    );

    const scheduleResult = await runScheduleCrawler({ date, sources });
    await appendScheduleItems(scheduleResult.scheduleItems);

    const results = await Promise.allSettled(
      enabledSources.map((source) => fetchSource(source, settings.bilibiliCookie)),
    );

    const successItems = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => ({
        ...result.value,
        crawlDate: date,
      }));

    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "未知错误");

    await appendRawItems(successItems);

    const allItems = await getRawItems();
    const dayItems = allItems.filter((item) => item.crawlDate === date);
    const scheduleItems = await getScheduleItemsByDate(date);
    const existingIssue = await getIssueByDate(date);
    const issue = buildDailyDraft({
      date,
      rawItems: dayItems,
      scheduleItems,
      existingIssue,
    });
    await upsertIssue(issue);

    await addLog({
      id: `crawl-${Date.now()}`,
      type: "crawl",
      status: failed.length ? "partial" : "success",
      createdAt: new Date().toISOString(),
      message: `已抓取 ${successItems.length} 条原料，日程命中 ${scheduleResult.stats.matchedDateCount} 条${failed.length ? `，失败 ${failed.length} 条` : ""}`,
    });

    return NextResponse.json({
      message: failed.length
        ? `抓取完成，原料成功 ${successItems.length} 条，日程 ${scheduleResult.stats.matchedDateCount} 条，失败 ${failed.length} 条`
        : `抓取完成，原料入库 ${successItems.length} 条，日程 ${scheduleResult.stats.matchedDateCount} 条`,
      issue,
      failed,
    });
  } catch (error) {
    await addLog({
      id: `crawl-error-${Date.now()}`,
      type: "crawl",
      status: "error",
      createdAt: new Date().toISOString(),
      message: error.message,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
