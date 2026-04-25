import { NextResponse } from "next/server";

import { getTodayDateString } from "../../../../lib/date";
import { buildDailyDraft } from "../../../../lib/draft";
import { getIssueByDate, getRawItems, upsertIssue } from "../../../../lib/repository";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const date = body.date || getTodayDateString();
  const rawItems = await getRawItems();
  const existingIssue = await getIssueByDate(date);
  const issue = buildDailyDraft({
    date,
    rawItems: rawItems.filter((item) => item.crawlDate === date),
    existingIssue,
  });

  await upsertIssue(issue);

  return NextResponse.json({
    message: "草稿已重新生成",
    issue,
  });
}
