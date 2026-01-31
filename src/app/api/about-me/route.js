import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

const COLLECTION = "about_me";

function isAdmin(request) {
  const cookie = request.headers.get("cookie");
  return verifyAdminCookie(cookie);
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ order: 1, _id: 1 }).toArray();
    const data = list.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      title: doc.title,
      description: doc.description,
      iconSide: doc.iconSide ?? "left",
      order: doc.order ?? 0,
    }));
    return NextResponse.json(data);
  } catch (err) {
    console.error("about-me GET", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, title, description, iconSide, order } = body;
    if (!name || title == null || description == null) {
      return NextResponse.json({ error: "Missing name, title, or description" }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const doc = {
      name: String(name),
      title: String(title),
      description: String(description),
      iconSide: iconSide === "right" ? "right" : "left",
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    console.error("about-me POST", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, name, title, description, iconSide, order } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const update = {};
    if (name !== undefined) update.name = String(name);
    if (title !== undefined) update.title = String(title);
    if (description !== undefined) update.description = String(description);
    if (iconSide !== undefined) update.iconSide = iconSide === "right" ? "right" : "left";
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
    console.error("about-me PUT", err);
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
    console.error("about-me DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
