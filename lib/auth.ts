import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { query, hashSession } from "./local-db";
import { isDemoMode } from "./local-config";

const SESSION_COOKIE = "trazo_session";
export async function createLocalSession(adminId: string) { const token = randomBytes(32).toString("base64url"); await query("insert into sessions(admin_id,token_hash,expires_at) values($1,$2,now()+interval '7 days')", [adminId, hashSession(token)]); (await cookies()).set(SESSION_COOKIE, token, { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV === "production", path:"/", maxAge:604800 }); }
export async function clearLocalSession() { const jar = await cookies(); const token = jar.get(SESSION_COOKIE)?.value; if (token) await query("delete from sessions where token_hash=$1", [hashSession(token)]); jar.delete(SESSION_COOKIE); }
export async function getAdmin() { if (isDemoMode()) return { id:"demo-admin", email:"demo@trazo.local", demo:true }; const token = (await cookies()).get(SESSION_COOKIE)?.value; if (!token) return null; const result = await query<{id:string;email:string}>("select a.id,a.email from sessions s join admin_users a on a.id=s.admin_id where s.token_hash=$1 and s.expires_at>now() and a.active=true", [hashSession(token)]); const admin = result.rows[0]; return admin ? { id:admin.id, email:admin.email, demo:false } : null; }
export async function requireAdmin() { const admin = await getAdmin(); if (!admin) redirect("/admin/acceso"); return admin; }
