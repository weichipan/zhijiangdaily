import { NextResponse } from "next/server";

import { fetchSource } from "../../../../lib/bilibili";
import { getTodayDateString } from "../../../../lib/date";
import { buildDailyDraft } from "../../../../lib/draft";
import {
  addLog,
  appendRawItems,
  getIssueByDate,
  getRawItems,
  getSettings,
  getSources,
  upsertIssue,
} from "../../../../lib/repository";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();

  try {
    const [sources, settings] = await Promise.all([getSources(), getSettings()]);
    const enabledSources = sources.filter((source) => source.enabled);

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
    const existingIssue = await getIssueByDate(date);
    const issue = buildDailyDraft({ date, rawItems: dayItems, existingIssue });
    await upsertIssue(issue);

    await addLog({
      id: `crawl-${Date.now()}`,
      type: "crawl",
      status: failed.length ? "partial" : "success",
      createdAt: new Date().toISOString(),
      message: `已抓取 ${successItems.length} 条原料${failed.length ? `，失败 ${failed.length} 条` : ""}`,
    });

    return NextResponse.json({
      message: failed.length
        ? `抓取完成，成功 ${successItems.length} 条，失败 ${failed.length} 条`
        : `抓取完成，共入库 ${successItems.length} 条`,
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
