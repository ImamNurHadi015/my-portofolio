import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAdminCookie } from "@/lib/admin-auth";

const COLLECTION = "about_me";

function isAdmin(request) {
  const cookie = request.headers.get("cookie");
  return verifyAdminCookie(cookie);
}

function toPublicDoc(doc) {
  const out = {
    id: doc._id.toString(),
    name: doc.name,
    title: doc.title ?? "",
    iconSide: doc.iconSide ?? "left",
    order: doc.order ?? 0,
  };
  if (doc.description != null) out.description = doc.description;
  if (doc.institution != null) out.institution = doc.institution;
  if (doc.field != null) out.field = doc.field;
  if (doc.startYear != null) out.startYear = doc.startYear;
  if (doc.endYear != null) out.endYear = doc.endYear;
  if (doc.score != null) out.score = doc.score;
  if (Array.isArray(doc.skills)) out.skills = doc.skills;
  if (doc.company != null) out.company = doc.company;
  if (doc.industry != null) out.industry = doc.industry;
  if (doc.startDate != null) out.startDate = doc.startDate;
  if (doc.endDate != null) out.endDate = doc.endDate;
  if (doc.roleDescription != null) out.roleDescription = doc.roleDescription;
  if (doc.jobDescription != null) out.jobDescription = doc.jobDescription;
  if (doc.position != null) out.position = doc.position;
  if (doc.organization != null) out.organization = doc.organization;
  if (doc.location != null) out.location = doc.location;
  return out;
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json([]);
    const list = await db.collection(COLLECTION).find({}).sort({ order: 1, _id: 1 }).toArray();
    return NextResponse.json(list.map(toPublicDoc));
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
    const name = String(body.name || "").trim();
    const title = String(body.title ?? "").trim();
    const iconSide = body.iconSide === "right" ? "right" : "left";
    const order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;

    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const doc = { name, title, iconSide, order };

    if (name === "profile") {
      doc.description = String(body.description ?? "").trim();
      if (!title && !doc.description) return NextResponse.json({ error: "Profile needs title or description" }, { status: 400 });
    } else if (name === "education") {
      doc.institution = String(body.institution ?? "").trim();
      doc.field = String(body.field ?? "").trim();
      doc.startYear = String(body.startYear ?? "").trim(); // opsional
      doc.endYear = String(body.endYear ?? "").trim(); // opsional
      doc.score = String(body.score ?? "").trim();
      doc.skills = Array.isArray(body.skills) ? body.skills.map((s) => String(s).trim()).filter(Boolean) : [];
    } else if (name === "experience") {
      doc.company = String(body.company ?? "").trim();
      doc.industry = String(body.industry ?? "").trim();
      doc.startDate = String(body.startDate ?? "").trim(); // opsional
      doc.endDate = String(body.endDate ?? "").trim(); // opsional
      doc.roleDescription = String(body.roleDescription ?? "").trim();
      doc.jobDescription = String(body.jobDescription ?? "").trim();
      doc.skills = Array.isArray(body.skills) ? body.skills.map((s) => String(s).trim()).filter(Boolean) : [];
    } else if (name === "organization") {
      doc.position = String(body.position ?? "").trim();
      doc.organization = String(body.organization ?? "").trim();
      doc.location = String(body.location ?? "").trim();
      doc.startDate = String(body.startDate ?? "").trim(); // opsional
      doc.endDate = String(body.endDate ?? "").trim(); // opsional
      doc.jobDescription = String(body.jobDescription ?? "").trim();
      doc.skills = Array.isArray(body.skills) ? body.skills.map((s) => String(s).trim()).filter(Boolean) : [];
    } else {
      doc.description = String(body.description ?? "").trim();
    }

    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    const result = await db.collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...toPublicDoc({ _id: result.insertedId, ...doc }) });
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
    const id = body.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const update = {};
    const str = (v) => (v !== undefined ? String(v).trim() : undefined);
    const arr = (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : undefined);
    if (body.name !== undefined) update.name = str(body.name);
    if (body.title !== undefined) update.title = str(body.title);
    if (body.description !== undefined) update.description = str(body.description);
    if (body.iconSide !== undefined) update.iconSide = body.iconSide === "right" ? "right" : "left";
    if (body.order !== undefined) update.order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;
    if (body.institution !== undefined) update.institution = str(body.institution);
    if (body.field !== undefined) update.field = str(body.field);
    if (body.startYear !== undefined) update.startYear = str(body.startYear);
    if (body.endYear !== undefined) update.endYear = str(body.endYear);
    if (body.score !== undefined) update.score = str(body.score);
    if (body.skills !== undefined) update.skills = arr(body.skills);
    if (body.company !== undefined) update.company = str(body.company);
    if (body.industry !== undefined) update.industry = str(body.industry);
    if (body.startDate !== undefined) update.startDate = str(body.startDate);
    if (body.endDate !== undefined) update.endDate = str(body.endDate);
    if (body.roleDescription !== undefined) update.roleDescription = str(body.roleDescription);
    if (body.jobDescription !== undefined) update.jobDescription = str(body.jobDescription);
    if (body.position !== undefined) update.position = str(body.position);
    if (body.organization !== undefined) update.organization = str(body.organization);
    if (body.location !== undefined) update.location = str(body.location);

    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("about-me DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
