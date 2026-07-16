// Session token sederhana: base64url(payload) + "." + base64url(HMAC-SHA256 signature)
// Pakai Web Crypto API supaya kompatibel di middleware.ts (Edge Runtime) maupun API routes.

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 hari

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET belum di-set di environment variable. Isi dengan string acak yang panjang."
    );
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecretKey();
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });
  const payloadBytes = new TextEncoder().encode(payload);
  const key = await getHmacKey();
const signature = await crypto.subtle.sign("HMAC", key, payloadBytes as BufferSource);
  return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  try {
    const payloadBytes = fromBase64Url(payloadB64);
    const signatureBytes = fromBase64Url(sigB64);
    const key = await getHmacKey();

   const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp: number };
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = "omzet_session";
export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;