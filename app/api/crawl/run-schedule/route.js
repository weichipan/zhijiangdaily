import { NextResponse } from "next/server";

import { getTodayDateString } from "../../../../lib/date";
import {
  addCrawlRun,
  addLog,
  appendScheduleItems,
  getSources,
} from "../../../../lib/repository";
import { runScheduleCrawler } from "../../../../lib/schedule-crawler";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();

  try {
    const sources = await getSources();
    const result = await runScheduleCrawler({ date, sources });
    await appendScheduleItems(result.scheduleItems);

    const run = {
      id: `schedule-run-${Date.now()}`,
      runType: "schedule",
      status: "success",
      targetDate: date,
      createdAt: new Date().toISOString(),
      stats: result.stats,
      message: `日程抓取完成，共解析 ${result.stats.totalFetched} 条，命中 ${result.stats.matchedDateCount} 条。`,
    };

    await addCrawlRun(run);
    await addLog({
      id: `schedule-log-${Date.now()}`,
      type: "schedule",
      status: "success",
      createdAt: new Date().toISOString(),
      message: run.message,
    });

    return NextResponse.json({
      message: run.message,
      ...result,
    });
  } catch (error) {
    await addLog({
      id: `schedule-error-${Date.now()}`,
      type: "schedule",
      status: "error",
      createdAt: new Date().toISOString(),
      message: error.message,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
