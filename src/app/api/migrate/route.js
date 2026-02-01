import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

/** Seed data sama persis seperti data awal di page.js (sebelum pindah ke API). */
const DEFAULT_ABOUT_ME = [
  {
    name: "profile",
    title: "About Me",
    description: "I am Imam Nurhadi, a Bachelor's graduate in Information Technology from Institut Teknologi Sepuluh Nopember (ITS).\nI have a strong interest in Mobile Application and Website Development, focusing on building clean, functional, and user-friendly digital products.",
    iconSide: "left",
    order: 0,
  },
  {
    name: "education",
    title: "Education",
    description: "Institut Teknologi Sepuluh Nopember (ITS)\nBachelor of Information Technology\nGPA: 3.60\n\nMAN 2 Kota Kediri (Senior High School)\nFinal Average Score: 87.47",
    iconSide: "right",
    order: 1,
  },
  {
    name: "experience",
    title: "Experience",
    description: "Web Development Intern – PT. Suryasoft Konsultama\nFebruary 2025 – May 2025\n\nWorked as a Web Development Intern, collaborating with senior developers to build web applications using Laravel (PHP).\n\nResponsibilities included implementing user interfaces based on Figma designs, developing functional features, applying business logic, and integrating databases. This experience enhanced my understanding of web development workflows, teamwork, and best practices in building maintainable applications.\n\nLaravel · Web Development · Figma (Software) · Teamwork · GitHub",
    iconSide: "left",
    order: 2,
  },
  {
    name: "organization",
    title: "Organization",
    description: "External Relations Staff\nHimpunan Mahasiswa Teknologi Informasi ITS (HMIT ITS)\nFebruari 2024 – Februari 2025 (1 tahun 1 bulan) · Surabaya, Jawa Timur\n• Memulai dan mengoordinasikan kunjungan perusahaan ke Telkom untuk memperkenalkan mahasiswa ke lingkungan industri profesional.\n• Merencanakan dan melaksanakan 2 kegiatan bakti sosial sebagai bagian dari keterlibatan komunitas organisasi.\n• Mengorganisir 2 seminar yang berfokus pada pengembangan akademik dan karir.\n• Memulai dan melakukan 2 kegiatan benchmarking antar-asosiasi untuk berbagi praktik terbaik dan memperluas jaringan organisasi.\nTeamwork · Public Relations\n\nTraining Speaker / Facilitator – PP LKMM FTEIC 2023/2024\nBEM FTEIC ITS\nJanuari 2023 – Januari 2024 (1 tahun 1 bulan) · Surabaya, Jawa Timur · On-site\n• Berperan sebagai pembicara dan fasilitator dalam program pelatihan PP LKMM FTEIC 2023/2024 dengan menyampaikan dan menjelaskan materi pelatihan, memandu diskusi, dan membantu peserta memahami konsep yang disajikan.\n• Peran ini meningkatkan keterampilan berbicara di depan umum (public speaking), komunikasi, dan kepemimpinan.\nPublic Speaking · Leadership",
    iconSide: "right",
    order: 3,
  },
];

const DEFAULT_SKILLS = [
  {
    title: "Mobile Apps",
    description: "Experience developing mobile applications for academic and personal projects. Focus on UI implementation, feature integration, and app logic.",
    category: "mobile",
    icon: "/svg/hp.svg",
    projects: ["Academic mobile projects (ITS)", "Personal apps with cross-platform development"],
    certifications: ["/skills/mobile/mobile-1.png", "/skills/mobile/mobile-2.png"],
    order: 0,
  },
  {
    title: "Website",
    description: "Experience building web applications using modern frameworks. Implemented responsive UI, business logic, and database integration.",
    category: "website",
    icon: "/svg/web.svg",
    projects: ["Web Development Intern – PT. Suryasoft Konsultama (Laravel)", "Portfolio and personal websites (Next.js)"],
    certifications: ["/skills/website-1.jpg", "/skills/website-2.jpg"],
    order: 1,
  },
  {
    title: "Artificial Intelligence",
    description: "Academic projects related to AI and machine learning. Experience applying AI concepts for problem solving and automation.",
    category: "ai",
    icon: "/svg/ai.svg",
    projects: ["AI and ML coursework projects (ITS)", "Problem solving and automation projects"],
    certifications: ["/skills/ai/ai-1.png"],
    order: 2,
  },
  {
    title: "Public Speaking",
    description: "Experience presenting academic and organizational materials. Participated in seminars, presentations, and public speaking activities. Display certification images related to public speaking.",
    category: "public-speaking",
    icon: "/svg/presentasi.svg",
    projects: ["Training Speaker / Facilitator – PP LKMM FTEIC (BEM FTEIC ITS)", "Seminars and organizational presentations"],
    certifications: ["/skills/public_speaking/PPLKMM.png", "/skills/public_speaking/hublu.png"],
    order: 3,
  },
];

const DEFAULT_PORTFOLIO = [
  { title: "Mobile 1", category: "mobile", image: "/portofolio/mobile-1.png", description: "" },
  { title: "Mobile 2", category: "mobile", image: "/portofolio/mobile-2.png", description: "" },
  { title: "Website 1", category: "website", image: "/portofolio/website-1.png", description: "" },
  { title: "Website 2", category: "website", image: "/portofolio/website-2.png", description: "" },
  { title: "AI 1", category: "ai", image: "/portofolio/ai-1.png", description: "" },
  { title: "AI 2", category: "ai", image: "/portofolio/ai-2.png", description: "" },
  { title: "Public Speaking 1", category: "public-speaking", image: "/portofolio/public_speaking/public-speaking-1.jpeg", description: "" },
  { title: "Public Speaking 2", category: "public-speaking", image: "/portofolio/public_speaking/public-speaking-2.jpeg", description: "" },
  { title: "Public Speaking 3", category: "public-speaking", image: "/portofolio/public_speaking/public-speaking-3.jpeg", description: "" },
];

const DEFAULT_SOCIAL_LINKS = [
  { label: "Email", href: "mailto:imam@example.com", type: "email", order: 0 },
  { label: "GitHub 1", href: "https://github.com", type: "github", order: 1 },
  { label: "GitHub 2", href: "https://github.com", type: "github2", order: 2 },
  { label: "Instagram", href: "https://instagram.com", type: "instagram", order: 3 },
  { label: "WhatsApp", href: "https://wa.me/6281234567890", type: "whatsapp", order: 4 },
  { label: "LinkedIn", href: "https://linkedin.com", type: "linkedin", order: 5 },
];

export async function POST(request) {
  const cookie = request.headers.get("cookie");
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured (set MONGODB_URI)" }, { status: 503 });
    }
    const aboutCol = db.collection("about_me");
    const skillsCol = db.collection("skills");
    const portfolioCol = db.collection("portfolio_items");
    const socialCol = db.collection("social_links");

    const [aboutCount, skillsCount, portfolioCount, socialCount] = await Promise.all([
      aboutCol.countDocuments(),
      skillsCol.countDocuments(),
      portfolioCol.countDocuments(),
      socialCol.countDocuments(),
    ]);

    const inserted = { about_me: 0, skills: 0, portfolio_items: 0, social_links: 0 };

    if (aboutCount === 0) {
      const result = await aboutCol.insertMany(DEFAULT_ABOUT_ME);
      inserted.about_me = result.insertedCount;
    }
    if (skillsCount === 0) {
      const result = await skillsCol.insertMany(DEFAULT_SKILLS);
      inserted.skills = result.insertedCount;
    }
    if (portfolioCount === 0) {
      const docs = DEFAULT_PORTFOLIO.map((d) => ({
        ...d,
        filename: d.image.split("/").pop(),
        createdAt: new Date(),
      }));
      const result = await portfolioCol.insertMany(docs);
      inserted.portfolio_items = result.insertedCount;
    }
    if (socialCount === 0) {
      const result = await socialCol.insertMany(DEFAULT_SOCIAL_LINKS);
      inserted.social_links = result.insertedCount;
    }

    return NextResponse.json({ ok: true, inserted });
  } catch (err) {
    console.error("migrate POST", err);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
