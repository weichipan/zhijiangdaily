import { NextResponse } from "next/server";

import { getTodayDateString } from "../../../../lib/date";
import {
  addCrawlRun,
  addLog,
  appendScheduleItems,
  getSources,
} from "../../../../lib/repository";
import { runScheduleCrawler } from "../../../../lib/schedule-crawler";

async function executeScheduleRun(date) {
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

  return {
    message: run.message,
    ...result,
  };
}

function isAuthorizedCronRequest(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret) {
    return false;
  }

  return authorization === `Bearer ${secret}`;
}

async function handleError(error) {
  await addLog({
    id: `schedule-error-${Date.now()}`,
    type: "schedule",
    status: "error",
    createdAt: new Date().toISOString(),
    message: error.message,
  });

  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || getTodayDateString();

  try {
    return NextResponse.json(await executeScheduleRun(date));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();

  try {
    return NextResponse.json(await executeScheduleRun(date));
  } catch (error) {
    return handleError(error);
  }
}
