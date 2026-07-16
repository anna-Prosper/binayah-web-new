// Field-level AES-256-GCM encryption for PII stored in MongoDB.
//
// All encrypted values are prefixed with "enc:" so the decryptor can distinguish
// ciphertext from legacy plaintext — any value without the prefix is returned
// as-is. Values are keyed with a versioned keyring so rotating ENCRYPTION_KEY
// never orphans existing ciphertext:
//
//   current format:  enc:<kid>:<base64(iv|tag|ct)>
//   legacy format:   enc:<base64(iv|tag|ct)>        (pre-versioning; still read)
//
// <kid> = first 8 hex chars of sha256(key), derived from the key itself. To
// retire a key, move its hex into ENCRYPTION_KEYS_OLD (comma-separated) and set
// the replacement as ENCRYPTION_KEY — old rows keep decrypting until rewrapped.
// This mirrors binayah-api/src/lib/encryption.ts so both services agree on-wire.
//
// ENCRYPTION_KEY   — 32-byte hex (64 chars) — AES-256-GCM primary key
// ENCRYPTION_KEYS_OLD — optional comma-separated retired hex keys
// HMAC_KEY         — 32-byte hex (64 chars) — deterministic field hashes

import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes } from "crypto";

const ENC_PREFIX = "enc:";

function parseHexKey(hex: string, label = "ENCRYPTION_KEY"): Buffer {
  if (!hex || hex.length !== 64) {
    throw new Error(`${label} must be a 64-character hex string (32 bytes).`);
  }
  return Buffer.from(hex, "hex");
}

function kidFor(key: Buffer): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 8);
}

interface RingKey {
  kid: string;
  key: Buffer;
}

// Lazy-initialised so Next.js module evaluation doesn't throw at build time.
let _ring: RingKey[] | null = null;
let _primary: RingKey | null = null;
let _hmacKey: Buffer | null = null;

function loadRing(): RingKey[] {
  if (_ring) return _ring;
  const primaryKey = parseHexKey(process.env.ENCRYPTION_KEY || "");
  _primary = { kid: kidFor(primaryKey), key: primaryKey };

  const ring: RingKey[] = [_primary];
  const seen = new Set([_primary.kid]);
  for (const hex of (process.env.ENCRYPTION_KEYS_OLD || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    try {
      const key = parseHexKey(hex, "ENCRYPTION_KEYS_OLD");
      const kid = kidFor(key);
      if (!seen.has(kid)) {
        ring.push({ kid, key });
        seen.add(kid);
      }
    } catch {
      /* skip malformed retired key */
    }
  }
  _ring = ring;
  return _ring;
}

function primaryRingKey(): RingKey {
  loadRing();
  return _primary!;
}

function hmacKey(): Buffer {
  if (!_hmacKey) _hmacKey = parseHexKey(process.env.HMAC_KEY || "", "HMAC_KEY");
  return _hmacKey;
}

/** Encrypts a plaintext string with AES-256-GCM. Empty/nullish returned unchanged. */
export function encrypt(plaintext: string | null | undefined): string | undefined {
  if (!plaintext) return plaintext === "" ? "" : undefined;
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext; // already encrypted
  const { kid, key } = primaryRingKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${kid}:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

/**
 * Decrypts a value produced by `encrypt`. Non-prefixed values pass through
 * unchanged. Throws only if no key in the ring can authenticate the ciphertext.
 */
export function decrypt(ciphertext: string | null | undefined): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith(ENC_PREFIX)) return ciphertext; // plaintext (pre-migration)

  const rest = ciphertext.slice(ENC_PREFIX.length);
  const colon = rest.indexOf(":"); // base64 has no ":", so it marks the versioned form
  const kid = colon !== -1 ? rest.slice(0, colon) : null;
  const b64 = colon !== -1 ? rest.slice(colon + 1) : rest;

  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);

  const ring = loadRing();
  const ordered = kid ? [...ring.filter((k) => k.kid === kid), ...ring.filter((k) => k.kid !== kid)] : ring;

  let lastErr: unknown;
  for (const { key } of ordered) {
    try {
      const decipher = createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(ct).toString("utf8") + decipher.final("utf8");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("decrypt: no key could authenticate the ciphertext");
}

/** Like decrypt() but returns null instead of throwing on an unreadable value. */
export function tryDecrypt(ciphertext: string | null | undefined): string | null {
  try {
    return decrypt(ciphertext);
  } catch {
    return null;
  }
}

/** True if the value is encrypted but no key in the ring can decrypt it. */
export function isOrphaned(ciphertext: string | null | undefined): boolean {
  if (!ciphertext || !ciphertext.startsWith(ENC_PREFIX)) return false;
  return tryDecrypt(ciphertext) === null;
}

/**
 * Deterministic HMAC-SHA256 hex digest of the lowercased, trimmed value. Used
 * for indexed lookup fields (emailH, phoneH). Returns undefined for empty input.
 */
export function fieldHash(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return createHmac("sha256", hmacKey()).update(value.toLowerCase().trim()).digest("hex");
}
