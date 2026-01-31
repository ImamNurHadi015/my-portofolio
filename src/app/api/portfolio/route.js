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

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    const data = list.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      category: doc.category,
      image: doc.image,
      description: doc.description ?? "",
      createdAt: doc.createdAt?.toISOString?.() ?? null,
      filename: doc.filename ?? doc.image,
    }));
    return NextResponse.json(data);
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
    const { title, category, image, description } = body;
    if (!title || !validCategory(category) || !image) {
      return NextResponse.json({ error: "Missing or invalid title, category, image" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const doc = {
      title: String(title),
      category: String(category),
      image: String(image),
      description: description != null ? String(description) : "",
      filename: String(image).split("/").pop() || image,
      createdAt: new Date(),
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...doc });
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
    const { id, title, category, image, description } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (title !== undefined) update.title = String(title);
    if (category !== undefined && validCategory(category)) update.category = category;
    if (image !== undefined) {
      update.image = String(image);
      update.filename = String(image).split("/").pop() || image;
    }
    if (description !== undefined) update.description = String(description);
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
