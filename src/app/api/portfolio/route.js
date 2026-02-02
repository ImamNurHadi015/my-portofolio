import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

const COLLECTION = "portfolio_items";
const CATEGORIES = ["mobile", "website", "ai", "public-speaking"];

function isAdmin(request) {
  const cookie = request.headers.get("cookie");
  return verifyAdminCookie(cookie);
}

function validCategory(cat) {
  return CATEGORIES.includes(cat);
}

function normalizeCategories(val) {
  if (Array.isArray(val)) {
    return [...new Set(val.map((c) => String(c).trim()).filter(validCategory))];
  }
  if (val != null && val !== "") {
    const c = String(val).trim();
    if (validCategory(c)) return [c];
  }
  return [];
}

function normalizeImages(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { name: "", url: item };
    return { name: String(item.name ?? "").trim(), url: String(item.url ?? "").trim() };
  }).filter((item) => item.url);
}

export function toPublicPortfolio(doc) {
  const images = Array.isArray(doc.images) && doc.images.length > 0
    ? doc.images
    : (doc.image ? [{ name: doc.title ?? "", url: doc.image }] : []);
  const categories = Array.isArray(doc.categories) && doc.categories.length > 0
    ? doc.categories
    : (doc.category ? [doc.category] : ["mobile"]);
  const relatedSkills = Array.isArray(doc.relatedSkills) ? doc.relatedSkills.map((s) => String(s).trim()).filter((s) => s) : [];
  return {
    id: doc._id.toString(),
    title: doc.title ?? "",
    categories,
    description: doc.description ?? "",
    images,
    relatedSkills,
    createdAt: doc.createdAt?.toISOString?.() ?? null,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list.map(toPublicPortfolio), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error("portfolio GET", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { title, category, categories, image, images, description } = body;
    const imgs = normalizeImages(Array.isArray(images) && images.length > 0 ? images : (image ? [{ name: "", url: image }] : []));
    const cats = normalizeCategories(categories ?? category);
    if (!title || cats.length === 0 || imgs.length === 0) {
      return NextResponse.json({ error: "Missing or invalid title, minimal satu kategori, atau minimal satu gambar" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const relatedSkills = Array.isArray(body.relatedSkills) ? body.relatedSkills.map((s) => String(s).trim()).filter((s) => s) : [];
    const doc = {
      title: String(title),
      categories: cats,
      description: description != null ? String(description) : "",
      images: imgs,
      relatedSkills,
      createdAt: new Date(),
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...toPublicPortfolio({ _id: result.insertedId, ...doc }) });
  } catch (err) {
    console.error("portfolio POST", err);
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
    if (!id || typeof id !== "string") return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const hex24 = /^[a-f0-9]{24}$/i.test(id);
    if (!hex24) return NextResponse.json({ error: "Invalid id (must be 24-character hex)" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (body.title !== undefined) update.title = String(body.title);
    if (body.categories !== undefined) update.categories = normalizeCategories(body.categories);
    else if (body.category !== undefined) update.categories = normalizeCategories(body.category);
    if (body.description !== undefined) update.description = String(body.description);
    if (body.images !== undefined) update.images = normalizeImages(body.images);
    else if (body.image !== undefined) update.images = normalizeImages([{ name: "", url: body.image }]);
    if (body.relatedSkills !== undefined) update.relatedSkills = Array.isArray(body.relatedSkills) ? body.relatedSkills.map((s) => String(s).trim()).filter((s) => s) : [];
    if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("portfolio PUT", err);
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
    console.error("portfolio DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
