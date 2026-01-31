"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const profileImageSrc = "/img/Berfikir.png";
const profileImageAha = "/img/Aha.png";

// Icons for About Me sections (by name from API)
const ABOUT_ICONS = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  experience: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  organization: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// Portfolio labels and filters (static)
const portfolioCategoryLabels = {
  mobile: "Mobile Apps",
  website: "Website",
  ai: "Artificial Intelligence",
  "public-speaking": "Public Speaking",
};
const portfolioFilters = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile Apps" },
  { id: "website", label: "Website" },
  { id: "ai", label: "Artificial Intelligence" },
  { id: "public-speaking", label: "Public Speaking" },
];

// SVG bertaburan dengan jarak dari background lingkaran – seluruh SVG tanpa duplikasi (posisi %, ukuran, rotasi)
const scatteredSvgs = [
  { src: "/svg/hp.svg", top: "18%", left: "16%", size: 48, rotate: -12 },
  { src: "/svg/ai.svg", top: "20%", right: "16%", size: 52, rotate: 8 },
  { src: "/svg/web.svg", bottom: "28%", left: "16%", size: 46, rotate: -8 },
  { src: "/svg/organisasi.svg", bottom: "24%", right: "16%", size: 44, rotate: 15 },
  { src: "/svg/kolaborasi.svg", top: "34%", left: "14%", size: 42, rotate: -10 },
  { src: "/svg/presentasi.svg", top: "38%", right: "14%", size: 50, rotate: 6 },
];

/* About Me, Skills, Portfolio sama (putih); CONTACT ME biru */
const navLinks = [
  { href: "#about", label: "About Me", style: "putih" },
  { href: "#skills", label: "Skills", style: "putih" },
  { href: "#portfolio", label: "Portfolio", style: "putih" },
  { href: "#contact", label: "CONTACT ME", style: "biru" },
];

const socialLinks = [
  {
    href: "mailto:imam@example.com",
    label: "Email",
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    href: "https://github.com",
    label: "GitHub",
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const ADMIN_CLICK_WINDOW_MS = 2500;

export default function Home() {
  const router = useRouter();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const aboutRef = useRef(null);
  const portfolioRef = useRef(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [portfolioVisible, setPortfolioVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [portfolioModalImage, setPortfolioModalImage] = useState(null);
  const adminClickCountRef = useRef(0);
  const adminClickTimeoutRef = useRef(null);

  const [aboutSections, setAboutSections] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aboutRes, skillsRes, portfolioRes] = await Promise.all([
          fetch("/api/about-me", { credentials: "include" }),
          fetch("/api/skills", { credentials: "include" }),
          fetch("/api/portfolio", { credentials: "include" }),
        ]);
        const about = aboutRes.ok ? await aboutRes.json() : [];
        const skills = skillsRes.ok ? await skillsRes.json() : [];
        const portfolio = portfolioRes.ok ? await portfolioRes.json() : [];
        setAboutSections(Array.isArray(about) ? about : []);
        setSkillsData(Array.isArray(skills) ? skills : []);
        setPortfolioItems(
          Array.isArray(portfolio)
            ? portfolio.map((p) => ({
                id: p.id,
                filename: p.filename || p.title,
                categoryId: p.category,
                src: p.image,
              }))
            : []
        );
      } catch {
        setAboutSections([]);
        setSkillsData([]);
        setPortfolioItems([]);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  // Reveal: konten + SVG muncul dari belakang lingkaran setelah mount
  useEffect(() => {
    const t = setTimeout(() => setHasRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Navbar: transparan di hero, berwarna setelah scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animasi muncul saat section masuk viewport
  useEffect(() => {
    const aboutEl = aboutRef.current;
    const portfolioEl = portfolioRef.current;
    if (!aboutEl || !portfolioEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "about" && entry.isIntersecting) {
            setAboutVisible(true);
          }
          if (entry.target.id === "portfolio" && entry.isIntersecting) {
            setPortfolioVisible(true);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(aboutEl);
    observer.observe(portfolioEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#171717]">
      {/* Navbar: transparan di halaman utama, berwarna #7bc8ff setelah scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navbarScrolled ? "bg-[#7bc8ff] shadow-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <Link
            href="#"
            className={`text-xl font-bold tracking-tight transition-colors md:text-2xl ${
              navbarScrolled ? "text-white" : "text-[#171717]"
            }`}
          >
            IN
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
            {navLinks.map((link) => {
              const isPutih = link.style === "putih";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link inline-flex rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out select-none sm:inline-flex
                    hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] active:shadow-inner
                    ${
                      isPutih
                        ? "bg-white/25 text-white hover:bg-white/40"
                        : "bg-white text-[#7bc8ff] hover:bg-gray-100"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Hero Section - Diagonal Split dengan Biru Dominan */}
      <section className="relative min-h-screen bg-[#7bc8ff] pt-[72px] md:pt-20">
        <div className="grid min-h-[calc(100vh-72px)] md:grid-cols-[45%_55%] md:min-h-[calc(100vh-80px)]">
          {/* Bagian Kiri - Teks (Putih dengan Slant) */}
          <div className="hero-left-clip relative z-10 flex flex-col justify-center bg-white px-8 py-16 md:-mt-20 md:px-12 md:pt-40 lg:px-20">
            <p className="text-sm font-medium uppercase tracking-wider text-gray-600 md:text-base">
              Hi, I am
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717] md:text-5xl lg:text-6xl">
              Imam Nurhadi
            </h1>
            <p className="mt-3 text-lg text-gray-600 md:text-xl">
              Mobile and Website Development
            </p>
            <div className="mt-8 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-[#7bc8ff] hover:text-white"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Bagian Kanan - Foto Profil + SVG: sembunyi di belakang lingkaran, lalu muncul; klik = flip ke Aha */}
          <div className="relative flex min-h-[50vh] items-center justify-center md:min-h-[calc(100vh-80px)]">
            <div className="relative h-full w-full md:flex md:items-center md:justify-center">
              {/* SVG bertaburan: awalnya sembunyi (scale 0) di posisinya, lalu muncul dengan animasi */}
              {scatteredSvgs.map((item, i) => (
                <div
                  key={i}
                  className={`absolute z-10 hero-svg-item transition-transform duration-300 hover:scale-110 ${
                    hasRevealed ? "revealed" : ""
                  }`}
                  style={{
                    top: item.top,
                    bottom: item.bottom,
                    left: item.left,
                    right: item.right,
                    width: item.size,
                    height: item.size,
                    transform: hasRevealed
                      ? `rotate(${item.rotate}deg) scale(1)`
                      : "scale(0)",
                    opacity: hasRevealed ? 0.8 : 0,
                    transition: "opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transitionDelay: hasRevealed ? `${200 + i * 70}ms` : "0ms",
                  }}
                >
                  <img
                    src={item.src}
                    alt=""
                    className="h-full w-full object-contain drop-shadow-lg [filter:brightness(0)_invert(1)]"
                    aria-hidden
                  />
                </div>
              ))}
              {/* Lingkaran: konten di dalam awalnya scale kecil (bersembunyi), lalu reveal; klik = flip coin ke Aha */}
              <div className="relative z-0 flex h-[70vh] max-h-[600px] w-full items-center justify-center md:h-[85vh]">
                <div className="relative h-[min(48vh,360px)] w-[min(48vh,360px)] rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-white/60 md:h-[min(58vh,390px)] md:w-[min(58vh,390px)]">
                  <div
                    className={`absolute inset-0 scale-110 hero-circle-content ${
                      hasRevealed ? "revealed" : ""
                    }`}
                  >
                    <div
                      className="hero-flip-wrapper h-full w-full"
                      onClick={() => {
                        if (isFlipped) {
                          setIsFlipped(false);
                          return;
                        }
                        // Berfikir.png visible: count 5 consecutive clicks to open admin
                        if (adminClickTimeoutRef.current) clearTimeout(adminClickTimeoutRef.current);
                        adminClickCountRef.current += 1;
                        if (adminClickCountRef.current >= 5) {
                          adminClickCountRef.current = 0;
                          fetch("/api/admin-unlock", { method: "POST", credentials: "include" })
                            .then(() => router.push("/admin"))
                            .catch(() => {});
                          return;
                        }
                        adminClickTimeoutRef.current = setTimeout(() => {
                          adminClickCountRef.current = 0;
                        }, ADMIN_CLICK_WINDOW_MS);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (isFlipped) setIsFlipped(false);
                        }
                      }}
                      aria-label={
                        isFlipped ? "Tampilkan foto Berfikir" : "Tampilkan foto Aha"
                      }
                    >
                      <div
                        className={`hero-flip-inner h-full w-full ${
                          isFlipped ? "flipped" : ""
                        }`}
                      >
                        <div className="hero-flip-front absolute inset-0">
                          <Image
                            src={profileImageSrc}
                            alt="Imam Nurhadi - Berfikir"
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 80vw, 45vw"
                            priority
                          />
                        </div>
                        <div className="hero-flip-back absolute inset-0">
                          <Image
                            src={profileImageAha}
                            alt="Imam Nurhadi - Aha"
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 80vw, 45vw"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me - zig-zag layout, animasi fade/slide saat scroll */}
      <section
        ref={aboutRef}
        id="about"
        className={`scroll-mt-20 bg-white px-8 py-20 transition-all duration-700 md:px-12 lg:px-20 ${
          aboutVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-[#171717] mb-16 md:mb-20 text-center md:text-left">
            About Me
          </h2>

          <div className="space-y-16 md:space-y-24">
            {dataLoading ? (
              <p className="text-gray-500 text-center py-8">Memuat...</p>
            ) : aboutSections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada data.</p>
            ) : (
              aboutSections
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((sub, i) => (
                  <div
                    key={sub.id}
                    className={`about-zigzag grid gap-8 md:gap-12 md:grid-cols-2 md:items-center ${
                      aboutVisible ? "about-zigzag-visible" : ""
                    }`}
                    style={{
                      transitionDelay: aboutVisible ? `${120 + i * 100}ms` : "0ms",
                    }}
                  >
                    <div
                      className={`flex justify-center order-2 ${
                        sub.iconSide === "left" ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#7bc8ff]/10 text-[#7bc8ff] md:h-24 md:w-24"
                        aria-hidden
                      >
                        <div className="h-10 w-10 md:h-12 md:w-12">
                          {ABOUT_ICONS[sub.name] ?? ABOUT_ICONS.profile}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`order-1 ${
                        sub.iconSide === "left" ? "md:order-2" : "md:order-1"
                      } ${
                        sub.iconSide === "right"
                          ? "md:text-right md:flex md:flex-col md:items-end"
                          : ""
                      }`}
                    >
                      <h3 className="text-xl font-bold text-[#171717] md:text-2xl">
                        {sub.title}
                      </h3>
                      <div className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line [&>p]:mb-3 [&>p:last-child]:mb-0">
                        {sub.description}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Skills - kartu klik, detail expand di bawah */}
      <section
        id="skills"
        className="scroll-mt-20 bg-gray-50 px-8 py-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-[#171717] mb-4">Skills</h2>
          <p className="text-gray-600 leading-relaxed mb-12 max-w-2xl">
            Klik kartu untuk melihat detail pengalaman, proyek terkait, dan galeri.
          </p>

          {dataLoading ? (
            <p className="text-gray-500 py-8">Memuat...</p>
          ) : skillsData.length === 0 ? (
            <p className="text-gray-500 py-8">Belum ada data.</p>
          ) : (
          <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {skillsData.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() =>
                  setSelectedSkillId((prev) =>
                    prev === skill.id ? null : skill.id
                  )
                }
                className={`skills-card group flex flex-col items-center gap-3 rounded-2xl border-2 px-6 py-8 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-offset-2 ${
                  selectedSkillId === skill.id
                    ? "border-[#7bc8ff] bg-[#7bc8ff]/10 shadow-lg"
                    : "border-gray-200 bg-white hover:border-[#7bc8ff]/50 hover:bg-[#7bc8ff]/5"
                }`}
                aria-expanded={selectedSkillId === skill.id}
                aria-controls={`skill-detail-${skill.id}`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7bc8ff]/15 text-[#7bc8ff] transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={skill.icon}
                    alt=""
                    className="h-8 w-8 object-contain [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(69%)_saturate(1200%)_hue-rotate(186deg)_brightness(101%)_contrast(97%)]"
                    aria-hidden
                  />
                </div>
                <span className="font-semibold text-[#171717]">{skill.title}</span>
              </button>
            ))}
          </div>

          <div
            className="skills-detail-wrapper overflow-hidden transition-[grid-template-rows] duration-500 ease-out"
            style={{ gridTemplateRows: selectedSkillId ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
            {selectedSkillId && (() => {
              const skill = skillsData.find((s) => s.id === selectedSkillId);
              if (!skill) return null;
              return (
                <div
                  id={`skill-detail-${skill.id}`}
                  className="skills-detail-inner rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                  role="region"
                  aria-label={`Detail: ${skill.title}`}
                >
                  <div className="flex flex-col gap-6 md:gap-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-bold text-[#171717]">
                        {skill.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedSkillId(null)}
                        className="shrink-0 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#7bc8ff]"
                        aria-label="Tutup detail"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {skill.description}
                    </p>
                    {skill.projects && skill.projects.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold text-[#171717]">
                          Proyek terkait
                        </h4>
                        <ul className="list-disc space-y-1 pl-5 text-gray-600">
                          {skill.projects.map((project, i) => (
                            <li key={i}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {skill.certifications && skill.certifications.length > 0 && (
                      <div>
                        <h4 className="mb-3 font-semibold text-[#171717]">
                          Certification
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          {skill.certifications.map((src, i) => (
                            <div
                              key={`${skill.id}-${src}`}
                              className="relative w-full overflow-hidden rounded-xl bg-gray-100"
                            >
                              <img
                                src={src}
                                alt=""
                                className="block w-full max-w-full h-auto"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const wrap = e.target.closest("div");
                                  const fallback = wrap?.querySelector(".skill-certification-fallback");
                                  if (fallback) fallback.classList.remove("hidden");
                                }}
                              />
                              <span className="skill-certification-fallback absolute inset-0 hidden min-h-[120px] flex items-center justify-center bg-gray-100 text-sm text-gray-400 rounded-xl" aria-hidden>
                                Sertifikat tidak tersedia
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
          </>
          )}
        </div>
      </section>

      {/* Portfolio - filter kategori, grid gambar, modal preview */}
      <section
        ref={portfolioRef}
        id="portfolio"
        className={`scroll-mt-20 bg-white px-8 py-20 transition-all duration-700 md:px-12 lg:px-20 ${
          portfolioVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-[#171717] mb-4">Portfolio</h2>
          <p className="text-gray-600 leading-relaxed mb-10 max-w-2xl">
            Proyek dan karya berdasarkan kategori.
          </p>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-10">
            {portfolioFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPortfolioFilter(f.id)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  portfolioFilter === f.id
                    ? "bg-[#7bc8ff] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Portfolio grid */}
          {dataLoading ? (
            <p className="text-gray-500 py-8">Memuat...</p>
          ) : portfolioItems.length === 0 ? (
            <p className="text-gray-500 py-8">Belum ada data.</p>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(portfolioFilter === "all"
              ? portfolioItems
              : portfolioItems.filter((i) => i.categoryId === portfolioFilter)
            ).map((item) => (
              <button
                key={item.id ?? item.filename}
                type="button"
                onClick={() =>
                  setPortfolioModalImage(item.src)
                }
                className="portfolio-item group relative overflow-hidden rounded-xl bg-gray-100 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-offset-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      const wrap = e.target.closest(".relative");
                      if (e.target.parentElement) e.target.parentElement.style.display = "none";
                      const fallback = wrap?.querySelector(".portfolio-item-fallback");
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                  <span className="portfolio-item-fallback absolute inset-0 hidden flex items-center justify-center text-sm text-gray-400 bg-gray-100 rounded-xl" aria-hidden>
                    Gambar tidak tersedia
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-[#171717]">
                  {portfolioCategoryLabels[item.categoryId]}
                </p>
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Modal preview */}
        {portfolioModalImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPortfolioModalImage(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPortfolioModalImage(null);
            }}
            aria-label="Tutup preview"
          >
            <div
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <Image
                src={portfolioModalImage}
                alt="Preview"
                width={800}
                height={600}
                className="max-h-[90vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setPortfolioModalImage(null)}
                className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7bc8ff]"
                aria-label="Tutup"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Contact - placeholder */}
      <section
        id="contact"
        className="scroll-mt-20 bg-gray-50 px-8 py-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#171717]">Contact Me</h2>
          <p className="mt-4 text-gray-600">
            Tertarik bekerja sama? Hubungi saya melalui email atau media sosial.
          </p>
          <Link
            href="mailto:imam@example.com"
            className="mt-6 inline-block rounded-full bg-[#7bc8ff] px-8 py-3.5 font-semibold text-white transition hover:bg-[#5fb8f5]"
          >
            CONTACT ME
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#171717] px-8 py-12 text-white md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Imam Nurhadi. All rights reserved.
          </p>
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition hover:text-white"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
