import { NextRequest, NextResponse } from "next/server";
import { allowedEmail, encodeSession, googleConfigured, oauthState, oauthStateCookie, sessionCookie } from "@/lib/auth";

const publicUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://formulariotrazo.es";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get(oauthStateCookie)?.value;
  const nextParam = url.searchParams.get("next") || "/admin";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.includes("\\") ? nextParam : "/admin";
  if (!code || !state || !storedState || state !== storedState || !googleConfigured()) return NextResponse.redirect(new URL("/admin/acceso?error=unauthorized", publicUrl()));
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${publicUrl()}/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: "authorization_code" }), cache: "no-store" });
    if (!tokenResponse.ok) throw new Error("token exchange failed");
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) throw new Error("missing access token");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
    if (!profileResponse.ok) throw new Error("profile lookup failed");
    const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean };
    if (!profile.sub || !profile.email || profile.email_verified !== true || !allowedEmail(profile.email)) throw new Error("unauthorized");
    const response = NextResponse.redirect(new URL(next, publicUrl()));
    response.cookies.set(sessionCookie, encodeSession(profile.email, profile.sub), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
    response.cookies.delete(oauthStateCookie);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/admin/acceso?error=unauthorized", publicUrl()));
  }
}
