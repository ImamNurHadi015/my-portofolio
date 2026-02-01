import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

/** About Me: migrasi sesuai tampilan sebelumnya (gambar) – profile, education tanpa tahun wajib, experience/organization dengan format yang sama. */
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
    institution: "Institut Teknologi Sepuluh Nopember (ITS)",
    field: "Bachelor of Information Technology",
    startYear: "",
    endYear: "",
    score: "GPA: 3.60",
    skills: [],
    iconSide: "right",
    order: 1,
  },
  {
    name: "education",
    title: "Education",
    institution: "MAN 2 Kota Kediri",
    field: "Senior High School",
    startYear: "",
    endYear: "",
    score: "Final Average Score: 87.47",
    skills: [],
    iconSide: "right",
    order: 2,
  },
  {
    name: "experience",
    title: "Experience",
    company: "PT. Suryasoft Konsultama",
    industry: "Web Development Intern",
    startDate: "February 2025",
    endDate: "May 2025",
    roleDescription: "Full-Stack Developer | Hybrid",
    jobDescription: "Worked as a Web Development Intern, collaborating with senior developers to build web applications using Laravel (PHP).\n\nResponsibilities included implementing user interfaces based on Figma designs, developing functional features, applying business logic, and integrating databases. This experience enhanced my understanding of web development workflows, teamwork, and best practices in building maintainable applications.",
    skills: ["Laravel", "Php", "Figma (Software)", "Teamwork", "PostgreSQL"],
    iconSide: "left",
    order: 3,
  },
  {
    name: "organization",
    title: "Organization",
    position: "External Relations Staff",
    organization: "Himpunan Mahasiswa Teknologi Informasi ITS (HMIT ITS)",
    location: "Surabaya, Jawa Timur",
    startDate: "Februari 2024",
    endDate: "Februari 2025",
    jobDescription: "• Memulai dan mengoordinasikan kunjungan perusahaan ke Telkom untuk memperkenalkan mahasiswa ke lingkungan industri profesional.\n• Merencanakan dan melaksanakan 2 kegiatan bakti sosial sebagai bagian dari keterlibatan komunitas organisasi.\n• Mengorganisir 2 seminar yang berfokus pada pengembangan akademik dan karir.\n• Memulai dan melakukan 2 kegiatan benchmarking antar-asosiasi untuk berbagi praktik terbaik dan memperluas jaringan organisasi.",
    skills: ["Teamwork", "Public Relations"],
    iconSide: "right",
    order: 4,
  },
  {
    name: "organization",
    title: "Organization",
    position: "Training Speaker / Facilitator – PP LKMM FTEIC 2023/2024",
    organization: "BEM FTEIC ITS",
    location: "Surabaya, Jawa Timur · On-site",
    startDate: "Januari 2023",
    endDate: "Januari 2024",
    jobDescription: "• Berperan sebagai pembicara dan fasilitator dalam program pelatihan PP LKMM FTEIC 2023/2024 dengan menyampaikan dan menjelaskan materi pelatihan, memandu diskusi, dan membantu peserta memahami konsep yang disajikan.\n• Peran ini meningkatkan keterampilan berbicara di depan umum (public speaking), komunikasi, dan kepemimpinan.",
    skills: ["Public Speaking", "Leadership"],
    iconSide: "right",
    order: 5,
  },
];

const DEFAULT_SKILLS = [
  {
    title: "Mobile Apps",
    description: "Experience developing mobile applications for academic and personal projects. Focus on UI implementation, feature integration, and app logic.",
    category: "mobile",
    icon: "/svg/hp.svg",
    relatedProjects: [
      { name: "Academic mobile projects (ITS)", duration: "" },
      { name: "Personal apps with cross-platform development", duration: "" },
    ],
    images: [
      { name: "Mobile 1", url: "/skills/mobile/mobile-1.png" },
      { name: "Mobile 2", url: "/skills/mobile/mobile-2.png" },
    ],
    order: 0,
  },
  {
    title: "Website",
    description: "Experience building web applications using modern frameworks. Implemented responsive UI, business logic, and database integration.",
    category: "website",
    icon: "/svg/web.svg",
    relatedProjects: [
      { name: "Web Development Intern – PT. Suryasoft Konsultama (Laravel)", duration: "" },
      { name: "Portfolio and personal websites (Next.js)", duration: "" },
    ],
    images: [
      { name: "Website 1", url: "/skills/website-1.jpg" },
      { name: "Website 2", url: "/skills/website-2.jpg" },
    ],
    order: 1,
  },
  {
    title: "Artificial Intelligence",
    description: "Academic projects related to AI and machine learning. Experience applying AI concepts for problem solving and automation.",
    category: "ai",
    icon: "/svg/ai.svg",
    relatedProjects: [
      { name: "AI and ML coursework projects (ITS)", duration: "" },
      { name: "Problem solving and automation projects", duration: "" },
    ],
    images: [{ name: "AI 1", url: "/skills/ai/ai-1.png" }],
    order: 2,
  },
  {
    title: "Public Speaking",
    description: "Experience presenting academic and organizational materials. Participated in seminars, presentations, and public speaking activities. Display certification images related to public speaking.",
    category: "public-speaking",
    icon: "/svg/presentasi.svg",
    relatedProjects: [
      { name: "Training Speaker / Facilitator – PP LKMM FTEIC (BEM FTEIC ITS)", duration: "" },
      { name: "Seminars and organizational presentations", duration: "" },
    ],
    images: [
      { name: "PPLKMM", url: "/skills/public_speaking/PPLKMM.png" },
      { name: "Hublu", url: "/skills/public_speaking/hublu.png" },
    ],
    order: 3,
  },
];

const DEFAULT_PORTFOLIO = [
  { title: "Mobile 1", categories: ["mobile"], images: [{ name: "Mobile 1", url: "/portofolio/mobile-1.png" }], description: "", createdAt: new Date() },
  { title: "Mobile 2", categories: ["mobile"], images: [{ name: "Mobile 2", url: "/portofolio/mobile-2.png" }], description: "", createdAt: new Date() },
  { title: "Website 1", categories: ["website"], images: [{ name: "Website 1", url: "/portofolio/website-1.png" }], description: "", createdAt: new Date() },
  { title: "Website 2", categories: ["website"], images: [{ name: "Website 2", url: "/portofolio/website-2.png" }], description: "", createdAt: new Date() },
  { title: "AI 1", categories: ["ai"], images: [{ name: "AI 1", url: "/portofolio/ai-1.png" }], description: "", createdAt: new Date() },
  { title: "AI 2", categories: ["ai"], images: [{ name: "AI 2", url: "/portofolio/ai-2.png" }], description: "", createdAt: new Date() },
  { title: "Public Speaking 1", categories: ["public-speaking"], images: [{ name: "Public Speaking 1", url: "/portofolio/public_speaking/public-speaking-1.jpeg" }], description: "", createdAt: new Date() },
  { title: "Public Speaking 2", categories: ["public-speaking"], images: [{ name: "Public Speaking 2", url: "/portofolio/public_speaking/public-speaking-2.jpeg" }], description: "", createdAt: new Date() },
  { title: "Public Speaking 3", categories: ["public-speaking"], images: [{ name: "Public Speaking 3", url: "/portofolio/public_speaking/public-speaking-3.jpeg" }], description: "", createdAt: new Date() },
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

    // About Me: selalu reset lalu seed penuh agar profile + education + experience + organization semua ter-input
    await aboutCol.deleteMany({});
    const aboutResult = await aboutCol.insertMany(DEFAULT_ABOUT_ME);
    inserted.about_me = aboutResult.insertedCount;
    // Skills: reset lalu seed penuh agar struktur baru (duration, relatedProjects, images) ter-input
    await skillsCol.deleteMany({});
    const skillsResult = await skillsCol.insertMany(DEFAULT_SKILLS);
    inserted.skills = skillsResult.insertedCount;
    // Portfolio: reset lalu seed penuh agar gambar dari DB (images array)
    await portfolioCol.deleteMany({});
    const portfolioResult = await portfolioCol.insertMany(DEFAULT_PORTFOLIO);
    inserted.portfolio_items = portfolioResult.insertedCount;
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
