import { NextResponse } from "next/server";

import { getTodayDateString } from "../../../../lib/date";
import { runClipCrawlSkeleton } from "../../../../lib/clip-crawler";
import { addLog, addCrawlRun, appendClipCandidates, getSettings, getSources } from "../../../../lib/repository";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();
  const rawCandidatesBySource = body.rawCandidatesBySource || {};

  try {
    const [sources, settings] = await Promise.all([getSources(), getSettings()]);
    const run = await runClipCrawlSkeleton({
      date,
      sources,
      rawCandidatesBySource,
      cookie: settings.bilibiliCookie,
    });

    await appendClipCandidates(run.clipCandidates);
    await addCrawlRun(run);

    await addLog({
      id: `clip-crawl-${Date.now()}`,
      type: "clip-crawl",
      status: run.status === "success" ? "success" : "partial",
      createdAt: new Date().toISOString(),
      message: `切片候选骨架已运行，处理 ${run.stats.clipCandidateCount} 条候选，通过 ${run.stats.clipPassedCount} 条`,
    });

    return NextResponse.json({
      message: `切片候选骨架已运行，处理 ${run.stats.clipCandidateCount} 条候选，通过 ${run.stats.clipPassedCount} 条`,
      run,
    });
  } catch (error) {
    await addLog({
      id: `clip-crawl-error-${Date.now()}`,
      type: "clip-crawl",
      status: "error",
      createdAt: new Date().toISOString(),
      message: error.message,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
