import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createAdminCookie, COOKIE_NAME } from "@/lib/admin-auth";

const COLLECTION = "admin_users";

/**
 * POST: validasi username & password di server.
 * Credentials TIDAK pernah di-hardcode; hanya dibandingkan dengan hash di MongoDB.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      console.error("admin-login: username atau password kosong");
      return NextResponse.json({ error: "Login gagal" }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      console.error("admin-login: Database tidak tersedia (MONGODB_URI tidak diset atau koneksi gagal)");
      return NextResponse.json({ error: "Database tidak tersedia" }, { status: 503 });
    }

    const col = db.collection(COLLECTION);
    const count = await col.countDocuments();
    console.log("admin-login: jumlah admin_users =", count);
    
    if (count === 0 && process.env.ADMIN_USERNAME && process.env.ADMIN_INITIAL_PASSWORD) {
      console.log("admin-login: Membuat admin user baru:", process.env.ADMIN_USERNAME);
      const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 10);
      await col.insertOne({
        username: process.env.ADMIN_USERNAME,
        passwordHash: hash,
      });
    }

    const user = await col.findOne({ username });
    if (!user || !user.passwordHash) {
      console.error("admin-login: User tidak ditemukan:", username);
      return NextResponse.json({ error: "Login gagal" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      console.error("admin-login: Password tidak cocok untuk user:", username);
      return NextResponse.json({ error: "Login gagal" }, { status: 401 });
    }

    const cookieValue = createAdminCookie();
    if (!cookieValue) {
      console.error("admin-login: ADMIN_SECRET tidak diset, tidak bisa buat cookie");
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap" }, { status: 503 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("admin-login POST", err);
    return NextResponse.json({ error: "Login gagal" }, { status: 500 });
  }
}
