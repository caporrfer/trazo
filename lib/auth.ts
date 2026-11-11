import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookie = "trazo_session";
const ttlSeconds = 60 * 60 * 12;

function secret() {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SESSION_SECRET no configurado (mínimo 32 caracteres)");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeSession(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: "admin", exp: Math.floor(now / 1000) + ttlSeconds })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: string | undefined, now = Date.now()) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub?: string; exp?: number };
    if (parsed.sub !== "admin" || !parsed.exp || parsed.exp < Math.floor(now / 1000)) return null;
    return { sub: parsed.sub };
  } catch {
    return null;
  }
}

/** Formato: scrypt$<sal base64url>$<hash base64url>. Se genera con `node scripts/hash-password.mjs`. */
export function verifyPassword(password: string, stored = process.env.ADMIN_PASSWORD_HASH) {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password.normalize("NFKC"), Buffer.from(salt, "base64url"), expected.length || 64);
  return safeEqual(actual, expected);
}

export function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH?.startsWith("scrypt$") && process.env.AUTH_SESSION_SECRET);
}

export async function isAdmin() {
  return Boolean(decodeSession((await cookies()).get(sessionCookie)?.value));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/acceso");
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: ttlSeconds,
};

// Límite de intentos en memoria: por IP y global (por si rotan la IP).
const WINDOW_MS = 15 * 60 * 1000;
const PER_IP = 5;
const GLOBAL = 30;
const failures = new Map<string, number[]>();

function recent(key: string, now: number) {
  const list = (failures.get(key) || []).filter((time) => now - time < WINDOW_MS);
  failures.set(key, list);
  return list;
}

export function loginBlocked(ip: string, now = Date.now()) {
  return recent(ip, now).length >= PER_IP || recent("*", now).length >= GLOBAL;
}

export function recordFailure(ip: string, now = Date.now()) {
  recent(ip, now).push(now);
  recent("*", now).push(now);
}

export function clearFailures(ip: string) {
  failures.delete(ip);
}
