import { NextResponse } from "next/server";

import { getAdminPassword, setAdminAuthCookie } from "../../../../lib/auth";

export async function POST(request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const redirectTo = formData.get("redirect") || "/admin";

  if (password !== getAdminPassword()) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  await setAdminAuthCookie();
  return NextResponse.redirect(new URL(String(redirectTo), request.url));
}
