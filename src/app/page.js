"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Foto profil dari public/img/ (copy dari src/img/ ke public/img/ jika perlu)
const profileImageSrc = "/img/Berfikir.png";

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

export default function Home() {
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const aboutRef = useRef(null);
  const portfolioRef = useRef(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [portfolioVisible, setPortfolioVisible] = useState(false);

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
    return () => {
      observer.disconnect();
    };
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

          {/* Bagian Kanan - Foto Profil + SVG bertaburan */}
          <div className="relative flex min-h-[50vh] items-center justify-center md:min-h-[calc(100vh-80px)]">
            <div className="relative h-full w-full md:flex md:items-center md:justify-center">
              {/* SVG bertaburan di sekitar foto */}
              {scatteredSvgs.map((item, i) => (
                <div
                  key={i}
                  className="absolute z-10 opacity-80 transition-transform duration-300 hover:scale-110 hover:opacity-100"
                  style={{
                    top: item.top,
                    bottom: item.bottom,
                    left: item.left,
                    right: item.right,
                    width: item.size,
                    height: item.size,
                    transform: `rotate(${item.rotate}deg)`,
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
              {/* Foto profil dengan background lingkaran (ukuran lingkaran tetap, foto sedikit lebih besar di dalam) */}
              <div className="relative z-0 flex h-[70vh] max-h-[600px] w-full items-center justify-center md:h-[85vh]">
                <div className="relative h-[min(48vh,360px)] w-[min(48vh,360px)] rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-white/60 md:h-[min(58vh,390px)] md:w-[min(58vh,390px)]">
                  <div className="absolute inset-0 scale-110">
                    <Image
                      src={profileImageSrc}
                      alt="Imam Nurhadi - Profile"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 80vw, 45vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me - animasi muncul saat scroll */}
      <section
        ref={aboutRef}
        id="about"
        className={`scroll-mt-20 bg-white px-8 py-20 transition-all duration-700 md:px-12 lg:px-20 ${
          aboutVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-[#171717]">About Me</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bagian About Me. Tambahkan deskripsi singkat tentang diri Anda,
            pengalaman, dan passion di bidang Mobile dan Website Development.
          </p>
        </div>
      </section>

      {/* Skills - placeholder */}
      <section
        id="skills"
        className="scroll-mt-20 bg-gray-50 px-8 py-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-[#171717]">Skills</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bagian Skills. Daftar teknologi dan keahlian Anda (React, Next.js,
            React Native, dll).
          </p>
        </div>
      </section>

      {/* Portfolio - animasi muncul saat scroll */}
      <section
        ref={portfolioRef}
        id="portfolio"
        className={`scroll-mt-20 bg-white px-8 py-20 transition-all duration-700 md:px-12 lg:px-20 ${
          portfolioVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-[#171717]">Portfolio</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bagian Portfolio. Tampilkan proyek-proyek Anda dengan gambar dan
            tautan.
          </p>
        </div>
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
