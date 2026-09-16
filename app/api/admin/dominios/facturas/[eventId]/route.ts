import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseConfig, isDemoMode } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  await requireAdmin(); const { eventId } = await params;
  if (isDemoMode() || !hasSupabaseConfig()) return NextResponse.redirect(new URL("/admin/dominios", request.url));
  const supabase = await createSessionClient(); const { data, error } = await supabase.from("domain_events").select("file_path").eq("id", eventId).maybeSingle();
  if (error || !data?.file_path) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  const { data: signed, error: signedError } = await supabase.storage.from("domain-invoices").createSignedUrl(data.file_path, 300);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "No se ha podido abrir la factura" }, { status: 500 });
  redirect(signed.signedUrl);
}
