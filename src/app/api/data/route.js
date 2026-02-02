import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { toPublicDoc } from "@/app/api/about-me/route";
import { toPublicSkill } from "@/app/api/skills/route";
import { toPublicPortfolio } from "@/app/api/portfolio/route";

/**
 * Satu endpoint untuk semua data publik (about-me, skills, portfolio, social-links).
 * Satu cold start + satu koneksi MongoDB = jauh lebih cepat daripada 4 request terpisah.
 */
export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { aboutMe: [], skills: [], portfolio: [], socialLinks: [] },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    const [aboutMeRaw, skillsRaw, portfolioRaw, socialRaw] = await Promise.all([
      db.collection("about_me").find({}).sort({ order: 1, _id: 1 }).toArray(),
      db.collection("skills").find({}).sort({ order: 1, _id: 1 }).toArray(),
      db.collection("portfolio_items").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("social_links").find({}).sort({ order: 1, _id: 1 }).toArray(),
    ]);

    const aboutMe = aboutMeRaw.map(toPublicDoc);
    const skills = skillsRaw.map(toPublicSkill);
    const portfolio = portfolioRaw.map(toPublicPortfolio);
    const socialLinks = socialRaw.map((doc) => ({
      id: doc._id.toString(),
      label: doc.label,
      href: doc.href,
      type: doc.type,
      order: doc.order ?? 0,
    }));

    return NextResponse.json(
      { aboutMe, skills, portfolio, socialLinks },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("data GET", err);
    return NextResponse.json(
      { error: "Failed to fetch", aboutMe: [], skills: [], portfolio: [], socialLinks: [] },
      { status: 500 }
    );
  }
}
