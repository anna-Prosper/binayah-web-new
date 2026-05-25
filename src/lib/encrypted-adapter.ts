// Custom NextAuth adapter that transparently encrypts users.email and users.name
// in MongoDB using AES-256-GCM. Wraps @auth/mongodb-adapter and overrides the
// 5 methods that touch email/name. All other adapter methods (sessions, accounts,
// verification tokens) are delegated to the base adapter unchanged.
//
// HMAC emailH field is stored alongside the encrypted email so getUserByEmail
// lookups still work without decrypting every row.

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { MongoClient } from "mongodb";
import { encrypt, decrypt, fieldHash } from "@/lib/encryption";

type ClientPromise = Promise<MongoClient>;
type AdapterOptions = Parameters<typeof MongoDBAdapter>[1];

function encryptUserFields(user: Partial<AdapterUser>): Partial<AdapterUser> & { emailH?: string } {
  const out: Partial<AdapterUser> & { emailH?: string } = { ...user };
  if (user.email) {
    out.email = (encrypt(user.email) ?? user.email) as string;
    out.emailH = fieldHash(user.email);
  }
  if (user.name) {
    out.name = encrypt(user.name) ?? user.name;
  }
  return out;
}

function decryptUserFields(user: AdapterUser): AdapterUser {
  return {
    ...user,
    email: (decrypt(user.email) || user.email) as string,
    name: user.name ? decrypt(user.name) || user.name : user.name,
  };
}

export function EncryptedMongoDBAdapter(client: ClientPromise, options?: AdapterOptions): Adapter {
  const base = MongoDBAdapter(client, options) as Required<Adapter>;
  const dbName = options?.databaseName ?? "binayah_web_new_dev";

  return {
    ...base,

    async createUser(user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await base.createUser(encryptUserFields(user as AdapterUser) as any);
      return decryptUserFields(created);
    },

    async getUser(id) {
      const user = await base.getUser(id);
      return user ? decryptUserFields(user) : null;
    },

    // Override to use HMAC hash lookup instead of plaintext email query.
    // Falls back to plaintext lookup for pre-migration records.
    async getUserByEmail(email) {
      const db = (await client).db(dbName);
      const hash = fieldHash(email);
      const doc = await db.collection("users").findOne({ emailH: hash });
      if (doc) {
        return decryptUserFields({
          id: String(doc._id),
          email: decrypt(doc.email as string) || email,
          emailVerified: (doc.emailVerified as Date) ?? null,
          name: doc.name ? decrypt(doc.name as string) || null : null,
          image: (doc.image as string) ?? null,
        } as AdapterUser);
      }
      // Fallback: plaintext lookup for records that haven't been migrated yet
      const fallback = await base.getUserByEmail(email);
      return fallback ? decryptUserFields(fallback) : null;
    },

    async getUserByAccount(providerAccount) {
      const user = await base.getUserByAccount(providerAccount);
      return user ? decryptUserFields(user) : null;
    },

    async updateUser(user) {
      const updated = await base.updateUser(encryptUserFields(user as AdapterUser) as Partial<AdapterUser> & Pick<AdapterUser, "id">);
      return decryptUserFields(updated);
    },
  };
}
