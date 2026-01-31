import { NextResponse } from "next/server";
import { createAdminCookie, COOKIE_NAME } from "@/lib/admin-auth";

export async function POST() {
  const value = createAdminCookie();
  if (!value) {
    return NextResponse.json(
      { error: "Admin unlock not configured (ADMIN_SECRET)" },
      { status: 503 }
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
  return res;
}
