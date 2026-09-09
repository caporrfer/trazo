import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : "/admin";
  if (code) {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!error && data.user.email?.toLowerCase() === allowed)
      return NextResponse.redirect(new URL(next, request.url));
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(
    new URL("/admin/acceso?error=unauthorized", request.url),
  );
}
