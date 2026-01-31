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

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ order: 1, _id: 1 }).toArray();
    const data = list.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      category: doc.category,
      icon: doc.icon,
      projects: doc.projects ?? [],
      certifications: doc.certifications ?? [],
    }));
    return NextResponse.json(data);
  } catch (err) {
    console.error("skills GET", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { title, description, category, icon, projects, certifications } = body;
    if (!title || !description || !validCategory(category)) {
      return NextResponse.json({ error: "Missing or invalid title, description, category" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const doc = {
      title: String(title),
      description: String(description),
      category: String(category),
      icon: icon ? String(icon) : "",
      projects: Array.isArray(projects) ? projects : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...doc });
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
    const { id, title, description, category, icon, projects, certifications, order } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (title !== undefined) update.title = String(title);
    if (description !== undefined) update.description = String(description);
    if (category !== undefined && validCategory(category)) update.category = category;
    if (icon !== undefined) update.icon = String(icon);
    if (projects !== undefined) update.projects = Array.isArray(projects) ? projects : [];
    if (certifications !== undefined) update.certifications = Array.isArray(certifications) ? certifications : [];
    if (order !== undefined) update.order = Number.isFinite(Number(order)) ? Number(order) : 0;
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
