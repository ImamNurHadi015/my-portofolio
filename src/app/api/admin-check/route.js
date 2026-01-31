import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-auth";

/**
 * GET: cek apakah request punya session admin valid.
 * Dipakai oleh halaman /admin untuk proteksi akses.
 */
export async function GET(request) {
  const cookie = request.headers.get("cookie");
  const valid = verifyAdminCookie(cookie);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
