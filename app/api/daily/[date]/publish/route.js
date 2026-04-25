import { NextResponse } from "next/server";

import { getIssueByDate, upsertIssue } from "../../../../../lib/repository";

export async function POST(_request, { params }) {
  const { date } = await params;
  const issue = await getIssueByDate(date);

  if (!issue) {
    return NextResponse.json({ error: "日报不存在" }, { status: 404 });
  }

  const nextIssue = {
    ...issue,
    status: "published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await upsertIssue(nextIssue);

  return NextResponse.json({
    message: "当天日报已发布",
    issue: nextIssue,
  });
}
