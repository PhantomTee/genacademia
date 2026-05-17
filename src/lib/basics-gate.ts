const BASICS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const BASICS_UNLOCK_LESSON = 3;

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

export function shouldUnlockBasics(lessonId: number) {
  return lessonId >= BASICS_UNLOCK_LESSON;
}

export function basicsCookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    maxAge: BASICS_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
  };
}

export async function createBasicsCompletionCookie(walletAddress: string) {
  const normalized = walletAddress.toLowerCase();
  const signature = await signPayload(normalized);
  return `${normalized}.${signature}`;
}

export async function verifyBasicsCompletionCookie(
  cookieValue: string | undefined,
  walletAddress: unknown
) {
  if (!cookieValue || typeof walletAddress !== "string") return false;
  const [address, signature] = cookieValue.split(".");
  if (!address || !signature) return false;
  if (address !== walletAddress.toLowerCase()) return false;

  const expected = await signPayload(address);
  return signature === expected;
}
