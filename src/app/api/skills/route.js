import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

const COLLECTION = "skills";
const CATEGORIES = ["mobile", "website", "ai", "public-speaking"];

function isAdmin(request) {
  const cookie = request.headers.get("cookie");
  return verifyAdminCookie(cookie);
}

function validCategory(cat) {
  return CATEGORIES.includes(cat);
}

function normalizeRelatedProjects(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { name: item.trim(), duration: "" };
    return { name: String(item.name ?? "").trim(), duration: String(item.duration ?? "").trim() };
  }).filter((item) => item.name);
}

function toPublicSkill(doc) {
  const raw = doc.relatedProjects ?? doc.projects ?? [];
  const relatedProjects = Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && raw[0] !== null && ("name" in raw[0] || "duration" in raw[0])
    ? normalizeRelatedProjects(raw)
    : (Array.isArray(raw) ? raw : []).map((s) => ({ name: String(s).trim(), duration: "" })).filter((p) => p.name);
  const images = Array.isArray(doc.images) && doc.images.length > 0
    ? doc.images
    : (doc.certifications ?? []).map((url) => ({ name: "", url }));
  return {
    id: doc._id.toString(),
    title: doc.title ?? "",
    description: doc.description ?? "",
    category: doc.category ?? "mobile",
    icon: doc.icon ?? "",
    relatedProjects,
    images,
    order: doc.order ?? 0,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ order: 1, _id: 1 }).toArray();
    return NextResponse.json(list.map(toPublicSkill));
  } catch (err) {
    console.error("skills GET", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

function normalizeImages(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { name: "", url: item };
    return { name: String(item.name ?? "").trim(), url: String(item.url ?? "").trim() };
  }).filter((item) => item.url);
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { title, description, category, icon, projects, certifications, relatedProjects, images } = body;
    if (!title || !description || !validCategory(category)) {
      return NextResponse.json({ error: "Missing or invalid title, description, category" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const rp = normalizeRelatedProjects(Array.isArray(relatedProjects) ? relatedProjects : (Array.isArray(projects) ? projects.map((p) => ({ name: String(p).trim(), duration: "" })) : []));
    const imgs = normalizeImages(images?.length ? images : certifications);
    const doc = {
      title: String(title),
      description: String(description),
      category: String(category),
      icon: icon ? String(icon) : "",
      relatedProjects: rp,
      images: imgs,
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...toPublicSkill({ _id: result.insertedId, ...doc }) });
  } catch (err) {
    console.error("skills POST", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (body.title !== undefined) update.title = String(body.title);
    if (body.description !== undefined) update.description = String(body.description);
    if (body.category !== undefined && validCategory(body.category)) update.category = body.category;
    if (body.icon !== undefined) update.icon = String(body.icon);
    if (body.relatedProjects !== undefined) update.relatedProjects = normalizeRelatedProjects(body.relatedProjects);
    else if (body.projects !== undefined) update.relatedProjects = normalizeRelatedProjects(Array.isArray(body.projects) ? body.projects.map((p) => (typeof p === "object" && p && "name" in p ? p : { name: String(p).trim(), duration: "" })) : []);
    if (body.images !== undefined) update.images = normalizeImages(body.images);
    else if (body.certifications !== undefined) update.images = normalizeImages(body.certifications);
    if (body.order !== undefined) update.order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("skills PUT", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("skills DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
