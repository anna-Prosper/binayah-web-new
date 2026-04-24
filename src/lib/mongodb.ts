import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Defer the error to runtime so Next.js can build without MONGODB_URI in the env.
  // Any awaited DB call will reject with a clear message.
  clientPromise = Promise.reject(new Error("Missing MONGODB_URI"));
} else if (process.env.NODE_ENV === "development") {
  const g = global as unknown as { _mongoClientPromise?: Promise<MongoClient> };
  if (!g._mongoClientPromise) {
    const client = new MongoClient(uri);
    g._mongoClientPromise = client.connect();
  }
  clientPromise = g._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
