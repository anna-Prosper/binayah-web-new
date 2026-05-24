// Field-level AES-256-GCM encryption for PII stored in MongoDB.
//
// All encrypted values are prefixed with "enc:" so the decryptor can
// distinguish ciphertext from legacy plaintext during the migration window —
// any value without the prefix is returned as-is, keeping reads safe before
// the migration script runs.
//
// ENCRYPTION_KEY  — 32-byte hex (64 chars) — used for AES-256-GCM
// HMAC_KEY        — 32-byte hex (64 chars) — used for deterministic field hashes
//
// Searchable fields (email, phone) store a separate HMAC hash field (emailH /
// phoneH) alongside the ciphertext so exact-match queries still work without
// exposing the plaintext.

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

const ENC_PREFIX = "enc:";

function getKey(envVar: string, label: string): Buffer {
  const hex = process.env[envVar];
  if (!hex || hex.length !== 64) {
    throw new Error(`${label} must be a 64-character hex string (32 bytes). Set ${envVar} in your environment.`);
  }
  return Buffer.from(hex, "hex");
}

// Lazy-initialised so Next.js module evaluation doesn't throw at build time
// when env vars aren't available.
let _encKey: Buffer | null = null;
let _hmacKey: Buffer | null = null;

function encKey(): Buffer {
  if (!_encKey) _encKey = getKey("ENCRYPTION_KEY", "ENCRYPTION_KEY");
  return _encKey;
}
function hmacKey(): Buffer {
  if (!_hmacKey) _hmacKey = getKey("HMAC_KEY", "HMAC_KEY");
  return _hmacKey;
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns `undefined` / empty string unchanged.
 */
export function encrypt(plaintext: string | null | undefined): string | undefined {
  if (!plaintext) return plaintext === "" ? "" : undefined;
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext; // already encrypted
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENC_PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

/**
 * Decrypts a value produced by `encrypt`.
 * If the value has no `enc:` prefix it is returned as-is (migration window).
 */
export function decrypt(ciphertext: string | null | undefined): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith(ENC_PREFIX)) return ciphertext; // plaintext (pre-migration)
  const buf = Buffer.from(ciphertext.slice(ENC_PREFIX.length), "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(ct).toString("utf8") + decipher.final("utf8");
}

/**
 * Returns a deterministic HMAC-SHA256 hex digest of the lowercased, trimmed
 * value. Used for indexed lookup fields (emailH, phoneH) so exact-match
 * queries work without storing plaintext.
 *
 * Returns `undefined` for empty / nullish input so callers can skip storing
 * the hash field when the source value is absent.
 */
export function fieldHash(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return createHmac("sha256", hmacKey())
    .update(value.toLowerCase().trim())
    .digest("hex");
}
