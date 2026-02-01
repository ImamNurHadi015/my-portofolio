import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

const COLLECTION = "social_links";
const TYPES = ["email", "github", "github2", "instagram", "whatsapp", "linkedin"];

function isAdmin(request) {
  const cookie = request.headers.get("cookie");
  return verifyAdminCookie(cookie);
}

function validType(t) {
  return TYPES.includes(t);
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ order: 1, _id: 1 }).toArray();
    const data = list.map((doc) => ({
      id: doc._id.toString(),
      label: doc.label,
      href: doc.href,
      type: doc.type,
      order: doc.order ?? 0,
    }));
    return NextResponse.json(data);
  } catch (err) {
    console.error("social-links GET", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { label, href, type } = body;
    if (!label || !href || !validType(type)) {
      return NextResponse.json({ error: "Missing or invalid label, href, type" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const count = await db.collection(COLLECTION).countDocuments();
    const item = {
      label: String(label).trim(),
      href: String(href).trim(),
      type: String(type),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : count,
    };
    const result = await db.collection(COLLECTION).insertOne(item);
    return NextResponse.json({ id: result.insertedId.toString(), ...item });
  } catch (err) {
    console.error("social-links POST", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

function isValidObjectIdString(str) {
  return typeof str === "string" && /^[a-f0-9]{24}$/i.test(str);
}

export async function PUT(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, label, href, type, order } = body;
    if (!id || !isValidObjectIdString(id)) return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (label !== undefined) update.label = String(label).trim();
    if (href !== undefined) update.href = String(href).trim();
    if (type !== undefined && validType(type)) update.type = type;
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
    console.error("social-links PUT", err);
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
    if (!id || !isValidObjectIdString(id)) return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("social-links DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
