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
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrateStatus, setMigrateStatus] = useState(null);
  const [activeSection, setActiveSection] = useState("about");
  const [editing, setEditing] = useState({ about: null, skills: null, portfolio: null, social: null });
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [portfolioSkillInput, setPortfolioSkillInput] = useState("");
  const [projectNameInput, setProjectNameInput] = useState("");
  const [projectDurationInput, setProjectDurationInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const socialTypes = [
    { id: "email", label: "Email" },
    { id: "github", label: "GitHub 1" },
    { id: "github2", label: "GitHub 2" },
    { id: "instagram", label: "Instagram" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/data`, fetchOpts);
      const data = res.ok ? await res.json() : {};
      if (Array.isArray(data.aboutMe)) setAboutMe(data.aboutMe);
      if (Array.isArray(data.skills)) setSkills(data.skills);
      if (Array.isArray(data.portfolio)) setPortfolio(data.portfolio);
      if (Array.isArray(data.socialLinks)) setSocialLinks(data.socialLinks);
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
    const isNew = !id || String(id).startsWith("new-");
    const name = form.name || "profile";
    let body = { name, title: form.title ?? "", iconSide: form.iconSide ?? "left", order: form.order ?? 0 };
    if (name === "profile") body.description = form.description ?? "";
    if (name === "education") Object.assign(body, { institution: form.institution ?? "", field: form.field ?? "", startYear: form.startYear ?? "", endYear: form.endYear ?? "", score: form.score ?? "", skills: form.skills ?? [] });
    if (name === "experience") Object.assign(body, { company: form.company ?? "", industry: form.industry ?? "", startDate: form.startDate ?? "", endDate: form.endDate ?? "", roleDescription: form.roleDescription ?? "", jobDescription: form.jobDescription ?? "", skills: form.skills ?? [] });
    if (name === "organization") Object.assign(body, { position: form.position ?? "", organization: form.organization ?? "", location: form.location ?? "", startDate: form.startDate ?? "", endDate: form.endDate ?? "", jobDescription: form.jobDescription ?? "", skills: form.skills ?? [] });
    const res = await fetch(`${API}/about-me`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isNew ? body : { id, ...body }), ...fetchOpts });
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
    const body = {
      title: form.title,
      description: form.description,
      category: form.category,
      icon: form.icon,
      duration: form.duration ?? "",
      relatedProjects: (form.relatedProjects ?? form.projects ?? []).map((p) => typeof p === "object" && p && "name" in p ? p : { name: String(p), duration: "" }),
      images: form.images ?? [],
      order: form.order,
    };
    const res = await fetch(`${API}/skills`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id, ...body } : body), ...fetchOpts });
    if (res.ok) {
      setEditing((e) => ({ ...e, skills: null }));
      setForm({});
      setProjectNameInput("");
      setProjectDurationInput("");
      await load();
    }
  }

  function normalizedRelatedProjects(f) {
    const raw = f.relatedProjects ?? f.projects ?? [];
    return raw.map((p) => typeof p === "object" && p && "name" in p ? p : { name: String(p), duration: "" });
  }

  function addSkillProject() {
    const name = projectNameInput.trim();
    if (!name) return;
    const duration = projectDurationInput.trim();
    setForm((f) => ({ ...f, relatedProjects: [...normalizedRelatedProjects(f), { name, duration }] }));
    setProjectNameInput("");
    setProjectDurationInput("");
  }

  function addSkillImage(file, imageName) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        images: [...(f.images ?? []), { name: imageName || file.name || "", url: reader.result }],
      }));
    };
    reader.readAsDataURL(file);
  }

  async function deleteSkill(id) {
    const res = await fetch(`${API}/skills?id=${id}`, { method: "DELETE", ...fetchOpts });
    if (res.ok) {
      setConfirmDelete(null);
      await load();
    }
  }

  function addPortfolioImage(file, imageName) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        images: [...(f.images ?? []), { name: imageName || file.name || "", url: reader.result }],
      }));
    };
    reader.readAsDataURL(file);
  }

  async function savePortfolio() {
    const id = editing.portfolio;
    const isNew = !id || id === "new";
    const categories = Array.isArray(form.categories) ? form.categories : (form.category ? [form.category] : []);
    if (categories.length === 0) return;
    const body = {
      title: form.title,
      categories,
      description: form.description ?? "",
      images: (form.images ?? []).length ? form.images : (form.image ? [{ name: "", url: form.image }] : []),
      relatedSkills: Array.isArray(form.relatedSkills) ? form.relatedSkills : [],
      githubUrl: form.githubUrl != null ? String(form.githubUrl).trim() || null : null,
    };
    const res = await fetch(`${API}/portfolio`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isNew ? body : { id, ...body }), ...fetchOpts });
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

  async function saveSocial() {
    const id = editing.social;
    const isNew = id === "new" || !id;
    const body = { label: form.label, href: form.href, type: form.type, order: form.order ?? 0 };
    const res = await fetch(`${API}/social-links`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isNew ? body : { id, ...body }), ...fetchOpts });
    if (res.ok) {
      setEditing((e) => ({ ...e, social: null }));
      setForm({});
      await load();
    }
  }

  async function deleteSocial(id) {
    const res = await fetch(`${API}/social-links?id=${id}`, { method: "DELETE", ...fetchOpts });
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
          { id: "social", label: "Media Sosial" },
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
        {/* About Me - structured: Profile, Education, Experience, Organization */}
        {activeSection === "about" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage About Me</h2>
            {editing.about !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <input placeholder="Section Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3" />
                <select value={form.iconSide ?? "left"} onChange={(e) => setForm((f) => ({ ...f, iconSide: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3">
                  <option value="left">Icon kiri</option>
                  <option value="right">Icon kanan</option>
                </select>
                {form.name === "profile" && (
                  <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3" />
                )}
                {form.name === "education" && (
                  <>
                    <input placeholder="Institution Name" value={form.institution ?? ""} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <input placeholder="Field of Study / Major" value={form.field ?? ""} onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input placeholder="Start Year (opsional)" value={form.startYear ?? ""} onChange={(e) => setForm((f) => ({ ...f, startYear: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                      <input placeholder="End Year (opsional)" value={form.endYear ?? ""} onChange={(e) => setForm((f) => ({ ...f, endYear: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <input placeholder="Final Score (e.g. GPA 3.60)" value={form.score ?? ""} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Related Skills (tekan Enter atau koma untuk tambah)</p>
                      <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = skillInput.trim(); if (v) setForm((f) => ({ ...f, skills: [...(f.skills ?? []), v] })); setSkillInput(""); } }} placeholder="Ketik skill lalu Enter" className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {(form.skills ?? []).map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-full bg-[#7bc8ff]/20 px-3 py-1 text-sm text-[#0d7ab8]">
                            {s}
                            <button type="button" onClick={() => setForm((f) => ({ ...f, skills: (f.skills ?? []).filter((_, j) => j !== i) }))} className="ml-1.5 text-gray-500 hover:text-red-600" aria-label="Hapus">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {form.name === "experience" && (
                  <>
                    <input placeholder="Company Name" value={form.company ?? ""} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <input placeholder="Industry / Field" value={form.industry ?? ""} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input placeholder="Start Date (opsional)" value={form.startDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                      <input placeholder="End Date (opsional)" value={form.endDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <input placeholder="Role Description" value={form.roleDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, roleDescription: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <textarea placeholder="Job Description" value={form.jobDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Related Skills (Enter atau koma)</p>
                      <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = skillInput.trim(); if (v) setForm((f) => ({ ...f, skills: [...(f.skills ?? []), v] })); setSkillInput(""); } }} placeholder="Ketik skill lalu Enter" className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {(form.skills ?? []).map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-full bg-[#7bc8ff]/20 px-3 py-1 text-sm text-[#0d7ab8]">
                            {s}
                            <button type="button" onClick={() => setForm((f) => ({ ...f, skills: (f.skills ?? []).filter((_, j) => j !== i) }))} className="ml-1.5 text-gray-500 hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {form.name === "organization" && (
                  <>
                    <input placeholder="Position / Role" value={form.position ?? ""} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <input placeholder="Organization Name" value={form.organization ?? ""} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <input placeholder="Location" value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input placeholder="Start Date (opsional)" value={form.startDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                      <input placeholder="End Date (opsional)" value={form.endDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <textarea placeholder="Job Description" value={form.jobDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Related Skills (Enter atau koma)</p>
                      <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = skillInput.trim(); if (v) setForm((f) => ({ ...f, skills: [...(f.skills ?? []), v] })); setSkillInput(""); } }} placeholder="Ketik skill lalu Enter" className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {(form.skills ?? []).map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-full bg-[#7bc8ff]/20 px-3 py-1 text-sm text-[#0d7ab8]">
                            {s}
                            <button type="button" onClick={() => setForm((f) => ({ ...f, skills: (f.skills ?? []).filter((_, j) => j !== i) }))} className="ml-1.5 text-gray-500 hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={saveAbout} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: null })); setForm({}); setSkillInput(""); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : null}
            {/* Profile */}
            <h3 className="text-md font-semibold text-[#171717] mt-6 mb-2">Profile</h3>
            {aboutMe.filter((x) => x.name === "profile").map((item) => (
              <li key={item.id} className="list-none bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4 mb-3">
                <div className="line-clamp-2 text-gray-600 flex-1">{item.title || "About Me"}</div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: item.id })); setForm({ name: "profile", title: item.title, description: item.description, iconSide: item.iconSide ?? "left", order: item.order ?? 0 }); setSkillInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                  {confirmDelete === item.id ? (<><button type="button" onClick={() => deleteAbout(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button><button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button></>) : (<button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>)}
                </div>
              </li>
            ))}
            <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: "new-profile" })); setForm({ name: "profile", title: "About Me", description: "", iconSide: "left", order: aboutMe.length }); setSkillInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">+ Tambah Profile</button>
            {/* Education */}
            <h3 className="text-md font-semibold text-[#171717] mt-6 mb-2">Education</h3>
            {aboutMe.filter((x) => x.name === "education").map((item) => (
              <li key={item.id} className="list-none bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4 mb-3">
                <div><p className="font-semibold text-[#171717]">{item.institution || item.title}</p><p className="text-sm text-gray-500">{item.field} {item.score ? ` · ${item.score}` : ""}</p></div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: item.id })); setForm({ name: "education", title: item.title, institution: item.institution, field: item.field, startYear: item.startYear, endYear: item.endYear, score: item.score, skills: item.skills ?? [], iconSide: item.iconSide ?? "left", order: item.order ?? 0 }); setSkillInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                  {confirmDelete === item.id ? (<><button type="button" onClick={() => deleteAbout(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button><button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button></>) : (<button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>)}
                </div>
              </li>
            ))}
            <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: "new-education" })); setForm({ name: "education", title: "Education", institution: "", field: "", startYear: "", endYear: "", score: "", skills: [], iconSide: "right", order: aboutMe.length }); setSkillInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">+ Tambah Education</button>
            {/* Experience */}
            <h3 className="text-md font-semibold text-[#171717] mt-6 mb-2">Experience</h3>
            {aboutMe.filter((x) => x.name === "experience").map((item) => (
              <li key={item.id} className="list-none bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4 mb-3">
                <div><p className="font-semibold text-[#171717]">{item.company} {item.industry ? ` · ${item.industry}` : ""}</p>{(item.startDate || item.endDate) && <p className="text-sm text-gray-500">{[item.startDate, item.endDate].filter(Boolean).join(" – ")}</p>}</div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: item.id })); setForm({ name: "experience", title: item.title, company: item.company, industry: item.industry, startDate: item.startDate, endDate: item.endDate, roleDescription: item.roleDescription, jobDescription: item.jobDescription, skills: item.skills ?? [], iconSide: item.iconSide ?? "left", order: item.order ?? 0 }); setSkillInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                  {confirmDelete === item.id ? (<><button type="button" onClick={() => deleteAbout(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button><button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button></>) : (<button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>)}
                </div>
              </li>
            ))}
            <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: "new-experience" })); setForm({ name: "experience", title: "Experience", company: "", industry: "", startDate: "", endDate: "", roleDescription: "", jobDescription: "", skills: [], iconSide: "left", order: aboutMe.length }); setSkillInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">+ Tambah Experience</button>
            {/* Organization */}
            <h3 className="text-md font-semibold text-[#171717] mt-6 mb-2">Organization</h3>
            {aboutMe.filter((x) => x.name === "organization").map((item) => (
              <li key={item.id} className="list-none bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4 mb-3">
                <div><p className="font-semibold text-[#171717]">{item.position} · {item.organization}</p>{(item.location || item.startDate || item.endDate) && <p className="text-sm text-gray-500">{[item.location, item.startDate && item.endDate ? `${item.startDate} – ${item.endDate}` : item.startDate || item.endDate].filter(Boolean).join(" · ")}</p>}</div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: item.id })); setForm({ name: "organization", title: item.title, position: item.position, organization: item.organization, location: item.location, startDate: item.startDate, endDate: item.endDate, jobDescription: item.jobDescription, skills: item.skills ?? [], iconSide: item.iconSide ?? "right", order: item.order ?? 0 }); setSkillInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                  {confirmDelete === item.id ? (<><button type="button" onClick={() => deleteAbout(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button><button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Batal</button></>) : (<button type="button" onClick={() => setConfirmDelete(item.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">Hapus</button>)}
                </div>
              </li>
            ))}
            <button type="button" onClick={() => { setEditing((e) => ({ ...e, about: "new-organization" })); setForm({ name: "organization", title: "Organization", position: "", organization: "", location: "", startDate: "", endDate: "", jobDescription: "", skills: [], iconSide: "right", order: aboutMe.length }); setSkillInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">+ Tambah Organization</button>
          </section>
        )}

        {/* Skills */}
        {activeSection === "skills" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage Skills</h2>
            {editing.skills !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 max-h-[85vh] overflow-y-auto">
                {/* Section A – Basic Info */}
                <h3 className="text-sm font-semibold text-[#171717] mb-2 border-b border-gray-200 pb-1">A. Info Dasar</h3>
                <input placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <select value={form.category ?? "mobile"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input placeholder="Icon path" value={form.icon ?? ""} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4" />

                {/* Section B – Related Projects (nama + durasi per proyek) */}
                <h3 className="text-sm font-semibold text-[#171717] mb-2 border-b border-gray-200 pb-1 mt-4">B. Proyek Terkait</h3>
                <p className="text-xs text-gray-500 mb-2">Satu proyek = nama proyek + durasi pengembangan. Isi lalu klik Tambah proyek.</p>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input placeholder="Nama proyek" value={projectNameInput} onChange={(e) => setProjectNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillProject(); } }} className="flex-1 rounded-lg border border-gray-300 px-3 py-2" />
                  <input placeholder="Durasi (e.g. 3 bulan, Feb 2024 – Mei 2024)" value={projectDurationInput} onChange={(e) => setProjectDurationInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillProject(); } }} className="flex-1 rounded-lg border border-gray-300 px-3 py-2" />
                  <button type="button" onClick={addSkillProject} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5] shrink-0">Tambah proyek</button>
                </div>
                <ul className="space-y-2 mb-4">
                  {normalizedRelatedProjects(form).map((p, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="font-medium text-[#171717]">{p.name}</span>
                      {p.duration && <span className="text-sm text-gray-500">{p.duration}</span>}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, relatedProjects: normalizedRelatedProjects(f).filter((_, j) => j !== i) }))} className="text-gray-500 hover:text-red-600 shrink-0" aria-label="Hapus">×</button>
                    </li>
                  ))}
                </ul>

                {/* Section C – Certificates / Images */}
                <h3 className="text-sm font-semibold text-[#171717] mb-2 border-b border-gray-200 pb-1 mt-4">C. Sertifikat / Gambar</h3>
                <div className="flex flex-wrap gap-4 mb-2">
                  <input type="text" placeholder="Nama gambar" id="skill-image-name" className="flex-1 min-w-[120px] rounded-lg border border-gray-300 px-3 py-2" />
                  <label className="inline-flex items-center rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[#5fb8f5]">
                    Pilih file
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const name = document.getElementById("skill-image-name")?.value?.trim() || f.name; addSkillImage(f, name); e.target.value = ""; } }} />
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {(form.images ?? []).map((img, i) => (
                    <div key={i} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                      <img src={img.url} alt={img.name || ""} className="w-full aspect-square object-cover" />
                      <p className="p-2 text-xs text-gray-600 truncate">{img.name || "Gambar"}</p>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, images: (f.images ?? []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600" aria-label="Hapus">×</button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={saveSkill} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: null })); setForm({}); setProjectNameInput(""); setProjectDurationInput(""); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: "new" })); setForm({ title: "", description: "", category: "mobile", icon: "/svg/hp.svg", relatedProjects: [], images: [], order: skills.length }); setProjectNameInput(""); setProjectDurationInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
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
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, skills: item.id })); setForm({ title: item.title, description: item.description, category: item.category, icon: item.icon ?? "", relatedProjects: item.relatedProjects ?? (item.projects ?? []).map((p) => typeof p === "object" && p && "name" in p ? p : { name: String(p), duration: "" }), images: item.images ?? [], order: item.order ?? 0 }); setProjectNameInput(""); setProjectDurationInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 max-h-[85vh] overflow-y-auto">
                <input placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <div className="mb-2">
                  <p className="text-sm font-medium text-[#171717] mb-2">Kategori (centang semua yang berlaku)</p>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((c) => {
                      const selected = Array.isArray(form.categories) ? form.categories.includes(c.id) : (form.category === c.id || (!form.categories && c.id === "mobile"));
                      return (
                        <label key={c.id} className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={(e) => {
                              setForm((f) => {
                                const current = Array.isArray(f.categories) ? [...f.categories] : (f.category ? [f.category] : ["mobile"]);
                                let next;
                                if (e.target.checked) {
                                  next = current.includes(c.id) ? current : [...current, c.id];
                                } else {
                                  next = current.filter((x) => x !== c.id);
                                  if (next.length === 0) return f;
                                }
                                return { ...f, categories: next };
                              });
                            }}
                            className="rounded border-gray-300 text-[#7bc8ff] focus:ring-[#7bc8ff]"
                          />
                          <span className="text-sm text-gray-700">{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium text-[#171717] mb-2">Skills Terkait (opsional)</p>
                  <p className="text-xs text-gray-500 mb-1">Ketik skill lalu Enter atau koma untuk tambah.</p>
                  <input
                    value={portfolioSkillInput}
                    onChange={(e) => setPortfolioSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const v = portfolioSkillInput.trim();
                        if (v) setForm((f) => ({ ...f, relatedSkills: [...(f.relatedSkills ?? []), v] }));
                        setPortfolioSkillInput("");
                      }
                    }}
                    placeholder="Ketik skill lalu Enter"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(form.relatedSkills ?? []).map((s, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-[#7bc8ff]/20 px-3 py-1 text-sm text-[#0d7ab8]">
                        {s}
                        <button type="button" onClick={() => setForm((f) => ({ ...f, relatedSkills: (f.relatedSkills ?? []).filter((_, j) => j !== i) }))} className="ml-1.5 text-gray-500 hover:text-red-600" aria-label="Hapus">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <input placeholder="Link GitHub (opsional)" value={form.githubUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" type="url" />
                <textarea placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4" />
                <h3 className="text-sm font-semibold text-[#171717] mb-2 border-b border-gray-200 pb-1">Gambar Portfolio</h3>
                <p className="text-xs text-gray-500 mb-2">Nama gambar + unggah file. Minimal satu gambar.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <input type="text" placeholder="Nama gambar" id="portfolio-image-name" className="flex-1 min-w-[120px] rounded-lg border border-gray-300 px-3 py-2" />
                  <label className="inline-flex items-center rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[#5fb8f5]">
                    Pilih file
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const name = document.getElementById("portfolio-image-name")?.value?.trim() || f.name; addPortfolioImage(f, name); e.target.value = ""; } }} />
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {(form.images ?? []).map((img, i) => (
                    <div key={i} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                      <img src={img.url} alt={img.name || ""} className="w-full aspect-[4/3] object-cover" />
                      <p className="p-2 text-xs text-gray-600 truncate">{img.name || "Gambar"}</p>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, images: (f.images ?? []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600" aria-label="Hapus">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={savePortfolio} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: null })); setForm({}); setPortfolioSkillInput(""); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: "new" })); setForm({ title: "", categories: ["mobile"], description: "", images: [], relatedSkills: [], githubUrl: "" }); setPortfolioSkillInput(""); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
                + Tambah Portfolio
              </button>
            )}
            <ul className="space-y-3">
              {portfolio.map((item) => (
                <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#171717]">{item.title}</p>
                    <p className="text-sm text-gray-500">{(item.categories ?? (item.category ? [item.category] : [])).map((cid) => categories.find((c) => c.id === cid)?.label ?? cid).join(", ")}</p>
                    {(item.relatedSkills ?? []).length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Skills: {(item.relatedSkills ?? []).join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 truncate">{(item.images ?? []).length} gambar</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, portfolio: item.id })); setForm({ title: item.title, categories: item.categories ?? (item.category ? [item.category] : ["mobile"]), description: item.description ?? "", images: item.images ?? [], relatedSkills: item.relatedSkills ?? [], githubUrl: item.githubUrl ?? "" }); setPortfolioSkillInput(""); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
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

        {/* Media Sosial */}
        {activeSection === "social" && (
          <section>
            <h2 className="text-lg font-bold text-[#171717] mb-4">Manage Media Sosial</h2>
            <p className="text-sm text-gray-600 mb-4">Link yang diklik di halaman utama (hero & footer) akan mengarah ke URL yang diisi di sini.</p>
            {editing.social !== null ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <input placeholder="Label (contoh: GitHub 1)" value={form.label ?? ""} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <input placeholder="URL (contoh: https://github.com/username)" value={form.href ?? ""} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2" />
                <select value={form.type ?? "email"} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4">
                  {socialTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={saveSocial} className="rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">Simpan</button>
                  <button type="button" onClick={() => { setEditing((e) => ({ ...e, social: null })); setForm({}); }} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setEditing((e) => ({ ...e, social: "new" })); setForm({ label: "", href: "", type: "email", order: socialLinks.length }); }} className="mb-4 rounded-full bg-[#7bc8ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5fb8f5]">
                + Tambah Media Sosial
              </button>
            )}
            <ul className="space-y-3">
              {socialLinks.map((item) => (
                <li key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171717]">{item.label}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">{item.href}</p>
                    <p className="text-xs text-gray-400">{socialTypes.find((t) => t.id === item.type)?.label ?? item.type}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setEditing((e) => ({ ...e, social: item.id })); setForm({ label: item.label, href: item.href, type: item.type ?? "email", order: item.order ?? 0 }); }} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                    {confirmDelete === item.id ? (
                      <>
                        <button type="button" onClick={() => deleteSocial(item.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white">Yakin Hapus?</button>
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
