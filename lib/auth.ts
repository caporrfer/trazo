import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "trazo_session";
const STATE_COOKIE = "trazo_oauth_state";
const ttlSeconds = 60 * 60 * 12;

function secret() {
  const value = process.env.AUTH_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("AUTH_SESSION_SECRET no configurado");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function encodeSession(email: string, id = email) {
  const payload = Buffer.from(JSON.stringify({ email, id, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function decodeSession(value: string | undefined) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email?: string; id?: string; exp?: number };
    if (!parsed.email || !parsed.id || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: parsed.email, id: parsed.id };
  } catch { return null; }
}
export function oauthState() { return randomBytes(24).toString("base64url"); }
export const oauthStateCookie = STATE_COOKIE;
export const sessionCookie = COOKIE;
export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXT_PUBLIC_APP_URL);
}
export function allowedEmail(email: string) {
  const allowed = (process.env.GOOGLE_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
export async function getAdmin() {
  if (process.env.NODE_ENV !== "production" && process.env.DEMO_MODE === "true") return { id: "demo-admin", email: "demo@trazo.local", demo: true };
  const value = (await cookies()).get(COOKIE)?.value;
  const session = decodeSession(value);
  if (!session || !allowedEmail(session.email)) return null;
  return { id: session.id, email: session.email, demo: false };
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/acceso");
  return admin;
}
