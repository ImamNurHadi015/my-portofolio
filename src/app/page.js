"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

// Ikon media sosial per type (digunakan dengan data dari API)
const SOCIAL_ICONS = {
  email: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  ),
  github: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  ),
  github2: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  ),
  instagram: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  ),
  whatsapp: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  linkedin: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

const ADMIN_CLICK_WINDOW_MS = 3000;

export default function Home() {
  const router = useRouter();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const aboutRef = useRef(null);
  const portfolioRef = useRef(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [portfolioVisible, setPortfolioVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [skillCertIndex, setSkillCertIndex] = useState(0);
  const [skillModalImage, setSkillModalImage] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [portfolioModalItem, setPortfolioModalItem] = useState(null);
  const [portfolioModalImageIndex, setPortfolioModalImageIndex] = useState(0);
  const adminClickCountRef = useRef(0);
  const adminClickTimeoutRef = useRef(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [aboutSections, setAboutSections] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [socialLinksFromApi, setSocialLinksFromApi] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Optimasi: memoize filtered portfolio items
  const filteredPortfolioItems = useMemo(() => {
    if (portfolioFilter === "all") return portfolioItems;
    return portfolioItems.filter((i) => (i.categoryIds ?? []).includes(portfolioFilter));
  }, [portfolioItems, portfolioFilter]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/data", { credentials: "include" });
        const data = res.ok ? await res.json() : {};
        const about = data.aboutMe ?? [];
        const skills = data.skills ?? [];
        const portfolio = data.portfolio ?? [];
        const social = data.socialLinks ?? [];
        setAboutSections(Array.isArray(about) ? about : []);
        setSkillsData(Array.isArray(skills) ? skills : []);
        setPortfolioItems(
          Array.isArray(portfolio)
            ? portfolio.map((p) => {
                const images = p.images ?? (p.image ? [{ name: p.title ?? "", url: p.image }] : []);
                const src = images[0]?.url ?? p.image ?? "";
                const categoryIds = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : []);
                return {
                  id: p.id,
                  title: p.title,
                  filename: p.title,
                  categoryIds,
                  images,
                  src,
                  relatedSkills: p.relatedSkills ?? [],
                  githubUrl: p.githubUrl && String(p.githubUrl).trim() ? String(p.githubUrl).trim() : null,
                };
              })
            : []
        );
        setSocialLinksFromApi(Array.isArray(social) ? social.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []);
      } catch {
        setAboutSections([]);
        setSkillsData([]);
        setPortfolioItems([]);
        setSocialLinksFromApi([]);
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

  // Responsif: deteksi layar sempit untuk hero SVG & tutup menu saat resize
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setIsNarrow(mq.matches);
      if (!mq.matches) setNavOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
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
          navbarScrolled || navOpen ? "bg-[#7bc8ff] shadow-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link
            href="#"
            onClick={() => setNavOpen(false)}
            className={`text-lg font-bold tracking-tight transition-colors sm:text-xl md:text-2xl ${
              navbarScrolled ? "text-white" : "text-[#171717]"
            }`}
          >
            IN
          </Link>
          {/* Desktop: link horizontal */}
          <div className="hidden items-center justify-end gap-2 md:flex md:gap-4">
            {navLinks.map((link) => {
              const isPutih = link.style === "putih";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link inline-flex rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out select-none
                    hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] active:shadow-inner
                    ${isPutih ? "bg-white/25 text-white hover:bg-white/40" : "bg-white text-[#7bc8ff] hover:bg-gray-100"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          {/* Mobile: hamburger + dropdown */}
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg md:hidden ${
              navbarScrolled ? "text-white hover:bg-white/20" : "text-[#171717] hover:bg-black/5"
            }`}
            aria-label={navOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={navOpen}
          >
            {navOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
        {/* Mobile dropdown - langsung menempel di bawah nav, tanpa jarak */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
            navOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-white/20 bg-[#7bc8ff]/95 px-4 pt-0 pb-2 shadow-lg backdrop-blur sm:px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isPutih = link.style === "putih";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setNavOpen(false)}
                    className={`rounded-full px-4 py-2.5 text-center text-sm font-medium transition
                      ${isPutih ? "bg-white/25 text-white hover:bg-white/40" : "bg-white text-[#7bc8ff] hover:bg-gray-100"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Diagonal Split dengan Biru Dominan */}
      <section className="relative min-h-screen bg-[#7bc8ff] pt-14 sm:pt-16 md:pt-20">
        <div className="grid min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] md:grid-cols-[45%_55%] md:min-h-[calc(100vh-80px)]">
          {/* Bagian Kiri - Teks (Putih dengan Slant) */}
          <div className="hero-left-clip relative z-10 flex flex-col justify-center bg-white px-5 py-10 sm:px-8 sm:py-12 md:-mt-20 md:px-12 md:py-16 md:pt-40 lg:px-20">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 sm:text-sm md:text-base">
              Hi, I am
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#171717] sm:mt-2 sm:text-4xl md:text-5xl lg:text-6xl">
              Imam Nurhadi
            </h1>
            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg md:text-xl">
              Mobile & Web Full-Stack Developer | AI Implementation
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              {socialLinksFromApi.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-[#7bc8ff] hover:text-white"
                  aria-label={social.label}
                >
                  {SOCIAL_ICONS[social.type] ?? SOCIAL_ICONS.email}
                </a>
              ))}
            </div>
          </div>

          {/* Bagian Kanan - Foto Profil + SVG: sembunyi di belakang lingkaran, lalu muncul; klik = flip ke Aha */}
          <div className="relative flex min-h-[45vh] items-center justify-center sm:min-h-[50vh] md:min-h-[calc(100vh-80px)]">
            <div className="relative h-full w-full max-w-full md:flex md:items-center md:justify-center">
              {/* SVG bertaburan: ukuran & posisi responsif (kecil di mobile) */}
              {scatteredSvgs.map((item, i) => {
                const size = isNarrow ? Math.max(22, Math.round(item.size * 0.45)) : item.size;
                return (
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
                      width: size,
                      height: size,
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
                );
              })}
              {/* Lingkaran: ukuran responsif; konten reveal + flip ke Aha */}
              <div className="relative z-0 flex h-[60vh] max-h-[320px] w-full items-center justify-center sm:h-[70vh] sm:max-h-[400px] md:h-[85vh] md:max-h-[600px]">
                <div className="relative h-[min(42vh,280px)] w-[min(42vh,280px)] shrink-0 rounded-full overflow-hidden bg-white shadow-xl ring-2 ring-white/60 sm:h-[min(48vh,340px)] sm:w-[min(48vh,340px)] sm:ring-4 md:h-[min(58vh,390px)] md:w-[min(58vh,390px)]">
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
                        // Berfikir.png visible: animasi coin (flip ke Aha) + hitung klik untuk admin
                        setIsFlipped(true);
                        if (adminClickTimeoutRef.current) clearTimeout(adminClickTimeoutRef.current);
                        adminClickCountRef.current += 1;
                        if (adminClickCountRef.current >= 5) {
                          adminClickCountRef.current = 0;
                          setShowLoginModal(true);
                          setLoginError(false);
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

      {/* About Me - zig-zag layout, structured (profile / education / experience / organization) */}
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

          {dataLoading ? (
            <p className="text-gray-500 text-center py-8">Memuat...</p>
          ) : aboutSections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data.</p>
          ) : (() => {
            const sorted = [...aboutSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const profileItems = sorted.filter((s) => s.name === "profile");
            const educationItems = sorted.filter((s) => s.name === "education");
            const experienceItems = sorted.filter((s) => s.name === "experience");
            const organizationItems = sorted.filter((s) => s.name === "organization");
            const sectionOrder = [
              { key: "profile", title: "Profile", items: profileItems, icon: "profile" },
              { key: "education", title: "Education", items: educationItems, icon: "education" },
              { key: "experience", title: "Experience", items: experienceItems, icon: "experience" },
              { key: "organization", title: "Organization", items: organizationItems, icon: "organization" },
            ].filter((s) => s.items.length > 0);

            const skillPill = (skill, idx) => (
              <span
                key={idx}
                className="inline-flex rounded-full bg-[#7bc8ff]/20 text-[#171717] px-3 py-1 text-sm font-medium"
              >
                {skill}
              </span>
            );

            return (
              <div className="space-y-16 md:space-y-24">
                {sectionOrder.map((section, i) => (
                  <div
                    key={section.key}
                    className={`about-zigzag grid gap-8 md:gap-12 md:grid-cols-2 md:items-start ${
                      aboutVisible ? "about-zigzag-visible" : ""
                    }`}
                    style={{
                      transitionDelay: aboutVisible ? `${120 + i * 100}ms` : "0ms",
                    }}
                  >
                    <div
                      className={`flex justify-center order-2 ${
                        section.items[0]?.iconSide === "right" ? "md:order-2" : "md:order-1"
                      }`}
                    >
                      <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#7bc8ff]/10 text-[#7bc8ff] md:h-24 md:w-24"
                        aria-hidden
                      >
                        <div className="h-10 w-10 md:h-12 md:w-12">
                          {ABOUT_ICONS[section.icon] ?? ABOUT_ICONS.profile}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`order-1 ${
                        section.items[0]?.iconSide === "right" ? "md:order-1 md:text-right md:flex md:flex-col md:items-end" : ""
                      }`}
                    >
                      <h3 className="text-xl font-bold text-[#171717] md:text-2xl">
                        {section.title}
                      </h3>

                      {/* Profile: single block with title + description */}
                      {section.key === "profile" && (
                        <div className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line">
                          {profileItems[0]?.title && (
                            <p className="font-semibold text-[#171717] mb-2">{profileItems[0].title}</p>
                          )}
                          {profileItems[0]?.description ?? ""}
                        </div>
                      )}

                      {/* Education: each entry = bold institution, field, years, score, skills */}
                      {section.key === "education" && (
                        <div className="mt-4 space-y-6">
                          {educationItems.map((entry) => (
                            <div key={entry.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                              <p className="font-bold text-[#171717]">{entry.institution ?? ""}</p>
                              {(entry.field || entry.startYear || entry.endYear || entry.score) && (
                                <p className="mt-1 text-gray-600 text-sm">
                                  {[entry.field, entry.startYear && entry.endYear ? `${entry.startYear} – ${entry.endYear}` : entry.startYear || entry.endYear, entry.score].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {entry.skills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {entry.skills.map(skillPill)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Experience: bold company + industry, dates, role, job description, skills */}
                      {section.key === "experience" && (
                        <div className="mt-4 space-y-6">
                          {experienceItems.map((entry) => (
                            <div key={entry.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                              <p className="font-bold text-[#171717]">{[entry.company, entry.industry].filter(Boolean).join(" · ")}</p>
                              {(entry.startDate || entry.endDate) && (
                                <p className="mt-1 text-gray-500 text-sm">
                                  {[entry.startDate, entry.endDate].filter(Boolean).join(" – ")}
                                </p>
                              )}
                              {entry.roleDescription && (
                                <p className="mt-1 text-gray-600 font-medium">{entry.roleDescription}</p>
                              )}
                              {entry.jobDescription && (
                                <div className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                  {entry.jobDescription.split(/\n+/).map((line, idx) => (
                                    <p key={idx} className="mb-1">{line}</p>
                                  ))}
                                </div>
                              )}
                              {entry.skills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {entry.skills.map(skillPill)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Organization: bold position + organization, location, dates, job description, skills */}
                      {section.key === "organization" && (
                        <div className="mt-4 space-y-6">
                          {organizationItems.map((entry) => (
                            <div key={entry.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                              <p className="font-bold text-[#171717]">{[entry.position, entry.organization].filter(Boolean).join(" · ")}</p>
                              {(entry.location || entry.startDate || entry.endDate) && (
                                <p className="mt-1 text-gray-500 text-sm">
                                  {[entry.location, entry.startDate && entry.endDate ? `${entry.startDate} – ${entry.endDate}` : entry.startDate || entry.endDate].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {entry.jobDescription && (
                                <div className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                  {entry.jobDescription.split(/\n+/).map((line, idx) => (
                                    <p key={idx} className="mb-1">{line}</p>
                                  ))}
                                </div>
                              )}
                              {entry.skills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {entry.skills.map(skillPill)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
                onClick={() => {
                  const next = selectedSkillId === skill.id ? null : skill.id;
                  setSelectedSkillId(next);
                  if (next) setSkillCertIndex(0);
                }}
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
              const relatedProjects = skill.relatedProjects ?? skill.projects ?? [];
              const images = skill.images ?? (skill.certifications ?? []).map((url) => (typeof url === "string" ? { name: "", url } : url));
              return (
                <div
                  id={`skill-detail-${skill.id}`}
                  className="skills-detail-inner rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 max-h-[80vh] overflow-y-auto"
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
                    {relatedProjects.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold text-[#171717]">
                          Proyek terkait
                        </h4>
                        <ul className="list-disc space-y-1.5 pl-5 text-gray-600">
                          {relatedProjects.map((project, i) => {
                            const name = typeof project === "object" && project && "name" in project ? project.name : String(project);
                            const duration = typeof project === "object" && project && "duration" in project ? project.duration : "";
                            return (
                              <li key={i}>
                                {name}
                                {duration && <span className="text-gray-500"> · {duration}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {images.length > 0 && (() => {
                      const PER_PAGE = 2;
                      const start = Math.min(skillCertIndex, Math.max(0, images.length - PER_PAGE));
                      const pageImages = images.slice(start, start + PER_PAGE);
                      const totalPages = Math.ceil(images.length / PER_PAGE);
                      const currentPage = Math.floor(start / PER_PAGE) + 1;
                      const hasPrev = start > 0;
                      const hasNext = start + PER_PAGE < images.length;
                      return (
                        <div>
                          <h4 className="mb-3 font-semibold text-[#171717]">
                            Sertifikat / Bukti
                          </h4>
                          <div className="relative flex items-stretch gap-2">
                            {images.length > PER_PAGE && (
                              <button
                                type="button"
                                onClick={() => setSkillCertIndex((i) => Math.max(0, i - PER_PAGE))}
                                disabled={!hasPrev}
                                className="shrink-0 flex h-10 w-10 self-center items-center justify-center rounded-full bg-[#7bc8ff] text-white transition hover:bg-[#5fb8f5] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-offset-2"
                                aria-label="Halaman sebelumnya"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              </button>
                            )}
                            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {pageImages.map((img, i) => {
                                const src = typeof img === "string" ? img : img?.url;
                                const alt = typeof img === "object" && img?.name ? img.name : "";
                                if (!src) return null;
                                return (
                                  <div key={`${start + i}`} className="flex justify-center">
                                    <div className="bg-gray-50 rounded-xl overflow-hidden w-fit max-w-full">
                                      <button
                                        type="button"
                                        onClick={() => setSkillModalImage(src)}
                                        className="block focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-inset rounded-xl"
                                      >
                                        <img
                                          src={src}
                                          alt={alt || "Sertifikat"}
                                          loading="lazy"
                                          decoding="async"
                                          className="block h-auto max-h-[36vh] w-auto object-contain"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            const wrap = e.target.closest("button");
                                            const fallback = wrap?.querySelector(".skill-cert-fallback");
                                            if (fallback) fallback.classList.remove("hidden");
                                          }}
                                        />
                                        <span className="skill-cert-fallback hidden min-h-[80px] flex items-center justify-center bg-gray-100 text-sm text-gray-400 rounded-xl" aria-hidden>
                                          Gambar tidak tersedia
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {images.length > PER_PAGE && (
                              <button
                                type="button"
                                onClick={() => setSkillCertIndex((i) => Math.min(images.length - PER_PAGE, i + PER_PAGE))}
                                disabled={!hasNext}
                                className="shrink-0 flex h-10 w-10 self-center items-center justify-center rounded-full bg-[#7bc8ff] text-white transition hover:bg-[#5fb8f5] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-offset-2"
                                aria-label="Halaman berikutnya"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            )}
                          </div>
                          {images.length > PER_PAGE && (
                            <p className="mt-2 text-center text-sm text-gray-500">
                              Halaman {currentPage} / {totalPages}
                            </p>
                          )}
                        </div>
                      );
                    })()}
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
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPortfolioItems.map((item) => (
              <button
                key={item.id ?? item.filename}
                type="button"
                onClick={() => { setPortfolioModalItem(item); setPortfolioModalImageIndex(0); }}
                className="portfolio-item group relative overflow-visible rounded-xl bg-[#e0f2fe] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7bc8ff] focus:ring-offset-2 w-full flex flex-col items-stretch"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl w-full bg-[#bae6fd] shrink-0">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.title ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const wrap = e.target.closest(".relative");
                        const fallback = wrap?.querySelector(".portfolio-item-fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  {item.githubUrl && (
                    <a
                      href={item.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/80"
                      aria-label="Buka di GitHub"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  <span className="portfolio-item-fallback absolute inset-0 hidden flex items-center justify-center text-sm text-gray-500 bg-[#bae6fd] rounded-xl" aria-hidden>
                    Gambar tidak tersedia
                  </span>
                </div>
                <div className="mt-3 px-3 pb-3 flex-1 min-h-0 flex flex-col">
                  {item.title && (
                    <p className="text-sm font-semibold text-[#171717] truncate" title={item.title}>{item.title}</p>
                  )}
                  <p className="text-sm font-medium text-gray-600 truncate mt-0.5" title={(item.categoryIds ?? []).map((cid) => portfolioCategoryLabels[cid]).filter(Boolean).join(", ")}>
                    {(item.categoryIds ?? []).map((cid) => portfolioCategoryLabels[cid]).filter(Boolean).join(", ")}
                  </p>
                  {(item.relatedSkills ?? []).length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5 break-words">
                      {(item.relatedSkills ?? []).join(", ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Modal preview portfolio: satu item bisa banyak gambar (carousel) */}
        {portfolioModalItem && (() => {
          const images = portfolioModalItem.images ?? (portfolioModalItem.src ? [{ url: portfolioModalItem.src }] : []);
          const idx = Math.min(portfolioModalImageIndex, Math.max(0, images.length - 1));
          const current = images[idx];
          const src = current?.url ?? portfolioModalItem.src;
          const hasPrev = idx > 0;
          const hasNext = idx < images.length - 1;
          const close = () => { setPortfolioModalItem(null); setPortfolioModalImageIndex(0); };
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={close}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
                if (e.key === "ArrowLeft" && hasPrev) setPortfolioModalImageIndex((i) => i - 1);
                if (e.key === "ArrowRight" && hasNext) setPortfolioModalImageIndex((i) => i + 1);
              }}
              aria-label="Tutup preview"
            >
              <div
                className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                {images.length > 1 && hasPrev && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPortfolioModalImageIndex((i) => i - 1); }}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7bc8ff]"
                    aria-label="Gambar sebelumnya"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {src && (
                  <img
                    src={src}
                    alt={current?.name || portfolioModalItem.title || "Preview"}
                    loading="eager"
                    className="max-h-[90vh] w-auto object-contain"
                  />
                )}
                {images.length > 1 && hasNext && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPortfolioModalImageIndex((i) => i + 1); }}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7bc8ff]"
                    aria-label="Gambar berikutnya"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
                {images.length > 1 && (
                  <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                    {idx + 1} / {images.length}
                  </p>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7bc8ff]"
                  aria-label="Tutup"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Skill detail – modal preview gambar sertifikat */}
      {skillModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSkillModalImage(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSkillModalImage(null);
          }}
          aria-label="Tutup preview"
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <img
              src={skillModalImage}
              alt="Preview sertifikat"
              className="max-h-[90vh] w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setSkillModalImage(null)}
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
            {socialLinksFromApi.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition hover:text-white"
                aria-label={social.label}
              >
                {SOCIAL_ICONS[social.type] ?? SOCIAL_ICONS.email}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Modal login admin (muncul setelah 5 klik Berfikir.png) */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="login-modal-title" className="text-xl font-bold text-[#171717] mb-4">
              Admin Login
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError(false);
                setLoginSubmitting(true);
                try {
                  const res = await fetch("/api/admin-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ username: loginUsername, password: loginPassword }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok && data.ok) {
                    setShowLoginModal(false);
                    setLoginUsername("");
                    setLoginPassword("");
                    router.push("/admin");
                    return;
                  }
                  setLoginError(true);
                  setTimeout(() => {
                    setShowLoginModal(false);
                    setLoginError(false);
                    setLoginUsername("");
                    setLoginPassword("");
                    router.push("/");
                  }, 2000);
                } catch {
                  setLoginError(true);
                  setTimeout(() => {
                    setShowLoginModal(false);
                    setLoginError(false);
                    router.push("/");
                  }, 2000);
                } finally {
                  setLoginSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#171717] focus:border-[#7bc8ff] focus:ring-1 focus:ring-[#7bc8ff] outline-none transition"
                  autoComplete="username"
                  required
                  disabled={loginSubmitting}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[#171717] focus:border-[#7bc8ff] focus:ring-1 focus:ring-[#7bc8ff] outline-none transition"
                  autoComplete="current-password"
                  required
                  disabled={loginSubmitting}
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600 transition-opacity duration-200" role="alert">
                  Login gagal
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="flex-1 rounded-full bg-[#7bc8ff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5fb8f5] disabled:opacity-70 transition"
                >
                  {loginSubmitting ? "Memeriksa…" : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError(false);
                    setLoginUsername("");
                    setLoginPassword("");
                  }}
                  className="rounded-full bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
