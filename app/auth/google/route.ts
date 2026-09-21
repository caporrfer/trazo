import { NextRequest, NextResponse } from "next/server";
import { googleConfigured, oauthState, oauthStateCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!googleConfigured()) return NextResponse.redirect(new URL("/admin/acceso?error=config", process.env.NEXT_PUBLIC_APP_URL || request.url));
  const url = new URL(request.url);
  const state = oauthState();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://formulariotrazo.es"}/auth/google/callback`;
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  google.searchParams.set("redirect_uri", redirectUri);
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("prompt", "select_account");
  const response = NextResponse.redirect(google);
  response.cookies.set(oauthStateCookie, state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
