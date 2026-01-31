import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise = null;
if (uri) {
  if (process.env.NODE_ENV === "development" && global._mongoClientPromise) {
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = clientPromise;
    }
  }
}

/**
 * Get MongoDB database "portfolio". Call only on server.
 * Returns null if MONGODB_URI is not set (API dapat mengembalikan []).
 * @returns {Promise<import('mongodb').Db | null>}
 */
export async function getDb() {
  if (!clientPromise) return null;
  const c = await clientPromise;
  return c.db("portfolio");
}
