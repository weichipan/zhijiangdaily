import { NextResponse } from "next/server";

import { getSettings, saveSettings } from "../../../lib/repository";

export async function POST(request) {
  const body = await request.json();
  const settings = await getSettings();
  const nextSettings = {
    ...settings,
    bilibiliCookie: body.bilibiliCookie || "",
    lastCookieCheckAt: new Date().toISOString(),
  };

  await saveSettings(nextSettings);

  return NextResponse.json({
    message: "B 站 Cookie 已保存",
  });
}
