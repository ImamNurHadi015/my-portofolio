import { NextResponse } from "next/server";
import { createAdminCookie, COOKIE_NAME } from "@/lib/admin-auth";

/**
 * POST: set cookie admin hanya jika request membawa secret yang benar.
 * Body: { "unlockSecret": "<ADMIN_SECRET atau ADMIN_UNLOCK_SECRET>" }
 * Tanpa secret yang valid, endpoint mengembalikan 401 (keamanan).
 */
const UNLOCK_SECRET = process.env.ADMIN_UNLOCK_SECRET || process.env.ADMIN_SECRET;

export async function POST(request) {
  if (!UNLOCK_SECRET) {
    return NextResponse.json(
      { error: "Admin unlock not configured (ADMIN_SECRET)" },
      { status: 503 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    const secret = typeof body?.unlockSecret === "string" ? body.unlockSecret.trim() : "";
    if (!secret || secret !== UNLOCK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
