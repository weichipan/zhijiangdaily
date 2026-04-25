import { NextResponse } from "next/server";

import { getSources, saveSources } from "../../../lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSources());
}

export async function POST(request) {
  const sources = await request.json();
  await saveSources(sources);
  return NextResponse.json({
    message: "来源配置已保存",
  });
}
