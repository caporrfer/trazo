import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isDemoMode } from "@/lib/runtime-config";
import { createSessionClient } from "@/lib/data";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  await requireAdmin(); const { eventId } = await params;
  if (isDemoMode()) return NextResponse.redirect(new URL("/admin/dominios", request.url));
  const dataClient = await createSessionClient(); const { data, error } = await dataClient.from("domain_events").select("file_path").eq("id", eventId).maybeSingle();
  if (error || !data?.file_path) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  const { data: signed, error: signedError } = await dataClient.storage.from("domain-invoices").createSignedUrl(data.file_path, 300);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "No se ha podido abrir la factura" }, { status: 500 });
  redirect(signed.signedUrl);
}
