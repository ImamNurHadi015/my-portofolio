"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";
const fetchOpts = { credentials: "include" };

export default function AdminPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [aboutMe, setAboutMe] = useState([]);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrateStatus, setMigrateStatus] = useState(null);
  const [activeSection, setActiveSection] = useState("about");
  const [editing, setEditing] = useState({ about: null, skills: null, portfolio: null });
  const [form, setForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [a, s, p] = await Promise.all([
        fetch(`${API}/about-me`, fetchOpts).then((r) => r.json()),
        fetch(`${API}/skills`, fetchOpts).then((r) => r.json()),
        fetch(`${API}/portfolio`, fetchOpts).then((r) => r.json()),
      ]);
      if (Array.isArray(a)) setAboutMe(a);
      if (Array.isArray(s)) setSkills(s);
      if (Array.isArray(p)) setPortfolio(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API}/admin-check`, fetchOpts).then((r) => {
      if (r.status === 401) {
        router.replace("/");
        return;
      }
      setAuthChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (authChecking) return;
    load();
  }, [authChecking]);

  async function runMigrate() {
    setMigrateStatus("running");
    try {
      const res = await fetch(`${API}/migrate`, { method: "POST", ...fetchOpts });
      const data = await res.json();
      if (res.ok) {
        setMigrateStatus("ok");
        await load();
      } else setMigrateStatus("error");
    } catch {
      setMigrateStatus("error");
    }
  }

  async function saveAbout() {
    const id = editing.about;
    const body = { name: form.name, title: form.title, description: form.description, iconSide: form.iconSide, order: form.order };
    const url = id ? `${API}/about-me` : `${API}/about-me`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id, ...body } : body), ...fetchOpts });
    if (res.ok) {
      setEditing((e) => ({ ...e, about: null }));
      setForm({});
      await load();
    }
  }

  async function deleteAbout(id) {
    const res = await fetch(`${API}/about-me?id=${id}`, { method: "DELETE", ...fetchOpts });
    if (res.ok) {
      setConfirmDelete(null);
      await load();
    }
  }

  async function saveSkill() {
    const id = editing.skills;
    const body = { title: form.title, description: form.description, category: form.category, icon: form.icon, projects: form.projects ?? [], certifications: form.certifications ?? [], order: form.order };
    const res = await fetch(`${API}/skills`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id, ...body } : body), ...fetchOpts });
    if (res.ok) {
      setEditing((e) => ({ ...e, skills: null }));
      setForm({});
      await load();
    }
  }

  async function deleteSkill(id) {
    const res = await fetch(`${API}/skills?id=${id}`, { method: "DELETE", ...fetchOpts });
    if (res.ok) {
      setConfirmDelete(null);
      await load();
    }
  }

  async function savePortfolio() {
    const id = editing.portfolio;
    const body = { title: form.title, category: form.category, image: form.image, description: form.description ?? "" };
    const res = await fetch(`${API}/portfolio`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id, ...body } : body), ...fetchOpts });
    if (res.ok) {
      setEditing((e) => ({ ...e, portfolio: null }));
      setForm({});
      await load();
    }
  }

  async function deletePortfolio(id) {
    const res = await fetch(`${API}/portfolio?id=${id}`, { method: "DELETE", ...fetchOpts });
    if (res.ok) {
      setConfirmDelete(null);
      await load();
    }
  }

  const categories = [
    { id: "mobile", label: "Mobile Apps" },
    { id: "website", label: "Website" },
    { id: "ai", label: "Artificial Intelligence" },
    { id: "public-speaking", label: "Public Speaking" },
  ];

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#171717]">Admin</h1>
        <div className="flex items-center gap-4">
          {migrateStatus === null && (
            <button type="button" onClick={runMigrate} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5] transition">
              Jalankan Migrasi
            </button>
          )}
          {migrateStatus === "ok" && <span className="text-sm text-green-600">Migrasi selesai</span>}
          {migrateStatus === "error" && <span className="text-sm text-red-600">Migrasi gagal</span>}
          <Link href="/" className="rounded-full bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
            Kembali ke Halaman Utama
          </Link>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white px-6 flex gap-2">
        {[
          { id: "about", label: "About Me" },
          { id: "skills", label: "Skills" },
          { id: "portfolio", label: "Portfolio" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeSection === tab.id ? "border-[#7bc8ff] text-[#0d7ab8]" : "border-transparent text-gray-600 hover:text-[#171717]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* About Me */}
        {activeSection === "about" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage About Me</h2>
            {editing.about !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <input placeholder="Name (id)" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <input placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <select value={form.iconSide ?? "left"} onChange={(e) => setForm((f) => ({ ...f, iconSide: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4">
                  <option value="left">Icon kiri</option>
                  <option value="right">Icon kanan</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={saveAbout} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: null })); setForm({}); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: "new" })); setForm({ name: "", title: "", description: "", iconSide: "left", order: aboutMe.length }); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
                + Tambah About Me
              </button>
            )}
            <ul className="space-y-3">
              {aboutMe.map((item) => (
                <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171717]">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.name}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: item.id })); setForm({ name: item.name, title: item.title, description: item.description, iconSide: item.iconSide ?? "left", order: item.order ?? 0 }); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                    {confirmDelete === item.id ? (
                      <>
                        <button type="button" onClick={() => deleteAbout(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Skills */}
        {activeSection === "skills" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage Skills</h2>
            {editing.skills !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <input placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <select value={form.category ?? "mobile"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input placeholder="Icon path" value={form.icon ?? ""} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4" />
                <div className="flex gap-2">
                  <button type="button" onClick={saveSkill} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: null })); setForm({}); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: "new" })); setForm({ title: "", description: "", category: "mobile", icon: "/svg/hp.svg", projects: [], certifications: [], order: skills.length }); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
                + Tambah Skill
              </button>
            )}
            <ul className="space-y-3">
              {skills.map((item) => (
                <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171717]">{item.title}</p>
                    <p className="text-sm text-gray-500">{categories.find((c) => c.id === item.category)?.label ?? item.category}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: item.id })); setForm({ title: item.title, description: item.description, category: item.category, icon: item.icon ?? "", projects: item.projects ?? [], certifications: item.certifications ?? [], order: item.order ?? 0 }); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                    {confirmDelete === item.id ? (
                      <>
                        <button type="button" onClick={() => deleteSkill(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Portfolio */}
        {activeSection === "portfolio" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage Portfolio</h2>
            {editing.portfolio !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <input placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <select value={form.category ?? "mobile"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input placeholder="Image URL (e.g. /portofolio/...)" value={form.image ?? ""} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4" />
                <div className="flex gap-2">
                  <button type="button" onClick={savePortfolio} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: null })); setForm({}); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: "new" })); setForm({ title: "", category: "mobile", image: "", description: "" }); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
                + Tambah Portfolio
              </button>
            )}
            <ul className="space-y-3">
              {portfolio.map((item) => (
                <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171717]">{item.title}</p>
                    <p className="text-sm text-gray-500">{categories.find((c) => c.id === item.category)?.label ?? item.category}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{item.image}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: item.id })); setForm({ title: item.title, category: item.category, image: item.image ?? "", description: item.description ?? "" }); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                    {confirmDelete === item.id ? (
                      <>
                        <button type="button" onClick={() => deletePortfolio(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
