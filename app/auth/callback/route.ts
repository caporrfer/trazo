import { NextRequest, NextResponse } from "next/server";
import { createLocalSession } from "@/lib/auth";
import { query } from "@/lib/local-db";
export async function GET(request: NextRequest) {
  const code=request.nextUrl.searchParams.get("code"); const state=request.nextUrl.searchParams.get("state"); const expected=request.cookies.get("trazo_oauth_state")?.value;
  if(!code||!state||!expected||state!==expected) return NextResponse.redirect(new URL("/admin/acceso?error=unauthorized",request.url));
  const redirectUri=`${request.nextUrl.origin}/auth/callback`; const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID||"",client_secret:process.env.GOOGLE_CLIENT_SECRET||"",redirect_uri:redirectUri,grant_type:"authorization_code"})});
  if(!tokenResponse.ok) return NextResponse.redirect(new URL("/admin/acceso?error=unauthorized",request.url)); const tokens=await tokenResponse.json() as {access_token?:string}; const profile=await (await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:`Bearer ${tokens.access_token}`} })).json() as {sub?:string;email?:string;email_verified?:boolean}; const allowed=process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if(!profile.sub||!profile.email||!profile.email_verified||!allowed||profile.email.toLowerCase()!==allowed) return NextResponse.redirect(new URL("/admin/acceso?error=unauthorized",request.url)); const row=await query<{id:string}>("insert into admin_users(google_sub,email) values($1,$2) on conflict(email) do update set google_sub=excluded.google_sub returning id",[profile.sub,profile.email.toLowerCase()]); await createLocalSession(row.rows[0].id); const response=NextResponse.redirect(new URL("/admin",request.url)); response.cookies.delete("trazo_oauth_state"); return response;
}
