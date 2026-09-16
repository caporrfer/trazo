import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseConfig, isDemoMode } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

function cents(value: string) { return value ? Math.round(Number(value.replace(",", ".")) * 100) : null; }

export async function POST(request: Request, { params }: { params: Promise<{ domainId: string }> }) {
  await requireAdmin(); const { domainId } = await params; const form = await request.formData();
  const websiteId = String(form.get("websiteId") || ""); const eventDate = String(form.get("eventDate") || ""); const provider = String(form.get("provider") || "").trim(); const notes = String(form.get("notes") || "").trim(); const amount = cents(String(form.get("amount") || "")); const file = form.get("file");
  if (!websiteId || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || (file instanceof File && file.size > 10 * 1024 * 1024)) return NextResponse.json({ error: "Datos o archivo no válidos" }, { status: 400 });
  if (file instanceof File && file.size > 0 && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return NextResponse.json({ error: "Formato no permitido" }, { status: 400 });
  if (isDemoMode() || !hasSupabaseConfig()) return NextResponse.redirect(new URL(`/admin/dominios/${websiteId}`, request.url));
  const supabase = await createSessionClient();
  let filePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
    filePath = `${websiteId}/${domainId}/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("domain-invoices").upload(filePath, file, { contentType: file.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: "No se ha podido subir la factura" }, { status: 500 });
  }
  const { error } = await supabase.from("domain_events").insert({ domain_id: domainId, event_type: String(form.get("eventType") || "renewal"), event_date: eventDate, provider: provider || null, amount_cents: amount, notes: notes || null, file_path: filePath, file_name: file instanceof File && file.size > 0 ? file.name : null, file_mime: file instanceof File && file.size > 0 ? file.type : null, file_size: file instanceof File && file.size > 0 ? file.size : null });
  if (error) { if (filePath) await supabase.storage.from("domain-invoices").remove([filePath]); return NextResponse.json({ error: "No se ha podido registrar el movimiento" }, { status: 500 }); }
  if (String(form.get("eventType") || "renewal") === "renewal") {
    const { data: domain } = await supabase.from("managed_domains").select("next_renewal_on").eq("id", domainId).maybeSingle();
    if (domain?.next_renewal_on) {
      const next = new Date(`${domain.next_renewal_on}T12:00:00Z`); next.setUTCFullYear(next.getUTCFullYear() + 1);
      await supabase.from("managed_domains").update({ next_renewal_on: next.toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq("id", domainId);
    }
  }
  redirect(`/admin/dominios/${websiteId}`);
}
