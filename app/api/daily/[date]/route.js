import { NextResponse } from "next/server";

import { getIssueByDate, upsertIssue } from "../../../../lib/repository";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { date } = await params;
  const issue = await getIssueByDate(date);

  if (!issue) {
    return NextResponse.json({ error: "日报不存在" }, { status: 404 });
  }

  return NextResponse.json(issue);
}

export async function PUT(request, { params }) {
  const { date } = await params;
  const payload = await request.json();

  const nextIssue = {
    ...payload,
    date,
    updatedAt: new Date().toISOString(),
  };

  await upsertIssue(nextIssue);
  return NextResponse.json({
    message: "日报已保存",
    issue: nextIssue,
  });
}
