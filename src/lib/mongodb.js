import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise = null;
if (uri) {
  if (process.env.NODE_ENV === "development" && global._mongoClientPromise) {
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error:", err.message);
      return null;
    });
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = clientPromise;
    }
  }
} else {
  console.warn("MONGODB_URI tidak diset!");
}

/**
 * Get MongoDB database "portfolio". Call only on server.
 * Returns null if MONGODB_URI is not set (API dapat mengembalikan []).
 * @returns {Promise<import('mongodb').Db | null>}
 */
export async function getDb() {
  if (!clientPromise) return null;
  const c = await clientPromise;
  if (!c) return null; // koneksi gagal
  return c.db("portfolio");
}
