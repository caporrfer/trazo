"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isDemoMode } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

const optionalName = z.union([
  z.literal(""),
  z.string().trim().min(2).max(140),
]);
const optionalType = z.union([z.literal(""), z.string().trim().min(2).max(80)]);
const optionalSlug = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(80),
]);
function normalizeDemoUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const optionalDemoUrl = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      try {
        const url = new URL(normalizeDemoUrl(value));
        return url.protocol === "https:" && Boolean(url.hostname);
      } catch {
        return false;
      }
    }),
]);
const proposalSchema = z.object({
  businessName: optionalName,
  businessType: optionalType,
  slug: optionalSlug,
  demoUrl: optionalDemoUrl,
});

const uuidSchema = z.string().uuid();
const optionalUuidSchema = z.union([z.string().uuid(), z.literal("")]);
const localDateTimeSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  z.literal(""),
]);
const proposalUpdateSchema = z.object({
  id: uuidSchema,
  stage: z.enum(["draft", "prepared", "sent", "archived"]),
  commercialStatus: z.enum([
    "unclassified",
    "pending_contact",
    "contacted",
    "waiting",
    "interested",
    "client",
    "not_interested",
  ]),
  nextContactAt: localDateTimeSchema,
});
const proposalDetailsSchema = proposalSchema.extend({ id: uuidSchema });
const noteSchema = z.object({
  proposalId: uuidSchema,
  responseId: optionalUuidSchema,
  text: z.string().trim().min(1).max(3000),
});
const followupSchema = z.object({
  proposalId: uuidSchema,
  responseId: optionalUuidSchema,
  channel: z.enum(["whatsapp", "phone", "email", "other"]),
  result: z.string().trim().min(1).max(1000),
  nextContactAt: localDateTimeSchema,
});
const dateSchema = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]);
const moneySchema = z.string().trim().regex(/^\d{1,7}(?:[.,]\d{1,2})?$/);
const websiteSchema = z.object({
  businessId: z.union([z.string().uuid(), z.literal("")]), businessName: z.string().trim().max(140), proposalId: z.union([z.string().uuid(), z.literal("")]),
  websiteUrl: z.union([z.literal(""), z.string().trim().max(2048).refine((value) => { try { const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); return u.protocol === "https:" && Boolean(u.hostname); } catch { return false; } })]),
  activatedOn: dateSchema, maintenanceMonthly: z.union([z.literal(""), moneySchema]), notes: z.string().trim().max(5000),
});
const domainSchema = z.object({ websiteId: uuidSchema, id: z.union([uuidSchema, z.literal("")]), name: z.string().trim().min(3).max(253), provider: z.string().trim().max(120), contractedOn: dateSchema, nextRenewalOn: dateSchema, autoRenew: z.enum(["on", ""]), });
const domainEventSchema = z.object({ domainId: uuidSchema, eventType: z.enum(["purchase", "renewal", "other"]), eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), provider: z.string().trim().max(120), amount: z.union([z.literal(""), moneySchema]), notes: z.string().trim().max(2000), });
const paymentSchema = z.object({ websiteId: uuidSchema, paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), amount: moneySchema, periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), monthsCovered: z.coerce.number().int().min(1).max(60), notes: z.string().trim().max(2000), });

function invalidAction(): never {
  throw new Error(
    "La solicitud no es válida. Recarga la página e inténtalo de nuevo.",
  );
}

function cents(value: string) { return Math.round(Number(value.replace(",", ".")) * 100); }

function madridLocalToIso(value: string): string | null {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const requestedUtc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(requestedUtc))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const offset =
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) -
    requestedUtc;
  return new Date(requestedUtc - offset).toISOString();
}

export async function createProposal(formData: FormData) {
  await requireAdmin();
  const input = proposalSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/admin/propuestas/nueva?error=invalid");
  if (isDemoMode())
    redirect(
      "/admin/propuestas/11111111-1111-4111-8111-111111111111?demo=created",
    );
  const { data: proposalId, error } = await (
    await createSessionClient()
  ).rpc("create_proposal_with_business", {
    p_business_name: input.data.businessName,
    p_business_type: input.data.businessType,
    p_slug: input.data.slug,
    p_public_token: randomBytes(18).toString("base64url"),
    p_demo_url: normalizeDemoUrl(input.data.demoUrl),
  });
  if (error) redirect("/admin/propuestas/nueva?error=save");
  redirect(`/admin/propuestas/${proposalId}`);
}

export async function updateProposalDetails(formData: FormData) {
  await requireAdmin();
  const input = proposalDetailsSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) invalidAction();
  if (!isDemoMode()) {
    const { error } = await (
      await createSessionClient()
    ).rpc("update_proposal_details", {
      p_proposal_id: input.data.id,
      p_business_name: input.data.businessName,
      p_business_type: input.data.businessType,
      p_slug: input.data.slug,
      p_demo_url: normalizeDemoUrl(input.data.demoUrl),
      // La función SQL mantiene estos argumentos por compatibilidad, pero la
      // aplicación ya no recopila ni muestra datos de contacto interno.
      p_known_contact_name: "",
      p_known_contact_email: "",
      p_known_contact_phone: "",
    });
    if (error)
      throw new Error(
        error.message.includes("PUBLIC_LINK_LOCKED")
          ? "El slug ya no puede cambiarse porque la propuesta ya se activó."
          : "No se han podido actualizar los datos de la propuesta.",
      );
  }
  revalidatePath("/admin");
  revalidatePath("/admin/propuestas");
  revalidatePath(`/admin/propuestas/${input.data.id}`);
}

export async function updateProposal(formData: FormData) {
  await requireAdmin();
  const input = proposalUpdateSchema.safeParse({
    id: String(formData.get("id") || ""),
    stage: String(formData.get("stage") || ""),
    commercialStatus: String(formData.get("commercialStatus") || ""),
    nextContactAt: String(formData.get("nextContactAt") || ""),
  });
  if (!input.success) invalidAction();
  const { id, stage, commercialStatus } = input.data;
  const active = formData.get("active") === "on";
  const nextContactAt = madridLocalToIso(input.data.nextContactAt);
  if (!isDemoMode()) {
    const { error } = await (
      await createSessionClient()
    )
      .from("proposals")
      .update({
        stage,
        commercial_status: commercialStatus,
        is_active: active && stage !== "archived",
        next_contact_at: nextContactAt,
      })
      .eq("id", id);
    if (error) throw new Error("No se han podido guardar los cambios.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/propuestas");
  revalidatePath(`/admin/propuestas/${id}`);
}

export async function markProposalSent(formData: FormData) {
  await requireAdmin();
  const parsedId = uuidSchema.safeParse(String(formData.get("id") || ""));
  if (!parsedId.success) invalidAction();
  const id = parsedId.data;
  if (!isDemoMode()) {
    const { error } = await (await createSessionClient())
      .from("proposals")
      .update({ stage: "sent", sent_at: new Date().toISOString() })
      .eq("id", id);
    if (error)
      throw new Error("No se ha podido marcar la propuesta como enviada.");
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/propuestas/${id}`);
}

export async function addNote(formData: FormData) {
  const admin = await requireAdmin();
  const input = noteSchema.safeParse({
    proposalId: String(formData.get("proposalId") || ""),
    responseId: String(formData.get("responseId") || ""),
    text: String(formData.get("text") || ""),
  });
  if (!input.success) invalidAction();
  const { proposalId, text } = input.data;
  const responseId = input.data.responseId || null;
  if (!isDemoMode()) {
    const { error } = await (await createSessionClient()).from("notes").insert({
      proposal_id: proposalId,
      response_id: responseId,
      author_id: admin.id,
      body: text,
    });
    if (error) throw new Error("No se ha podido guardar la nota.");
  }
  revalidatePath(`/admin/propuestas/${proposalId}`);
  if (responseId) revalidatePath(`/admin/respuestas/${responseId}`);
}

export async function addFollowup(formData: FormData) {
  await requireAdmin();
  const input = followupSchema.safeParse({
    proposalId: String(formData.get("proposalId") || ""),
    responseId: String(formData.get("responseId") || ""),
    channel: String(formData.get("channel") || ""),
    result: String(formData.get("result") || ""),
    nextContactAt: String(formData.get("nextContactAt") || ""),
  });
  if (!input.success) invalidAction();
  const { proposalId, channel, result } = input.data;
  const responseId = input.data.responseId || null;
  const nextContactAt = madridLocalToIso(input.data.nextContactAt);
  if (!isDemoMode()) {
    const supabase = await createSessionClient();
    const { error } = await supabase.rpc("register_followup", {
      p_proposal_id: proposalId,
      p_response_id: responseId,
      p_channel: channel,
      p_result: result,
      p_next_contact_at: nextContactAt,
    });
    if (error) throw new Error("No se ha podido registrar el seguimiento.");
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/propuestas/${proposalId}`);
}

export async function markResponseRead(formData: FormData) {
  await requireAdmin();
  const parsedId = uuidSchema.safeParse(String(formData.get("id") || ""));
  if (!parsedId.success) invalidAction();
  const id = parsedId.data;
  if (!isDemoMode()) {
    const { error } = await (await createSessionClient())
      .from("responses")
      .update({ is_read: true })
      .eq("id", id);
    if (error)
      throw new Error("No se ha podido marcar la respuesta como leída.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/respuestas");
  revalidatePath(`/admin/respuestas/${id}`);
}

export async function deleteResponse(formData: FormData) {
  await requireAdmin();
  const parsedId = uuidSchema.safeParse(String(formData.get("id") || ""));
  if (!parsedId.success) invalidAction();
  const id = parsedId.data;
  if (!isDemoMode()) {
    const { error } = await (await createSessionClient())
      .from("responses")
      .delete()
      .eq("id", id);
    if (error) throw new Error("No se ha podido eliminar la respuesta.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/respuestas");
  redirect("/admin/respuestas?deleted=1");
}

export async function createManagedWebsite(formData: FormData) {
  await requireAdmin();
  const input = websiteSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/admin/dominios/nueva?error=invalid");
  const data = input.data;
  if (isDemoMode()) {
    const id = crypto.randomUUID();
    const { addDemoWebsite } = await import("@/lib/domain-store");
    const linkedProposal = data.proposalId ? (await import("@/lib/repository")).getAdminProposal(data.proposalId) : null;
    addDemoWebsite({ id, proposalId: data.proposalId || undefined, businessName: data.businessName || (await linkedProposal)?.businessName || "Cliente sin nombre", websiteUrl: data.websiteUrl || undefined, activatedOn: data.activatedOn || undefined, maintenanceMonthlyCents: data.maintenanceMonthly ? cents(data.maintenanceMonthly) : undefined, notes: data.notes || undefined, archived: false, domainCount: 0, domains: [], payments: [], paidMonths: 0, pendingMonths: 0, totalPaidCents: 0 });
    redirect(`/admin/dominios/${id}`);
  }
  const { data: id, error } = await (await createSessionClient()).rpc("create_managed_website", { p_business_id: data.businessId || null, p_business_name: data.businessName, p_website_url: data.websiteUrl ? (/^https:\/\//i.test(data.websiteUrl) ? data.websiteUrl : `https://${data.websiteUrl}`) : null, p_activated_on: data.activatedOn || null, p_maintenance_monthly_cents: data.maintenanceMonthly ? cents(data.maintenanceMonthly) : null, p_notes: data.notes || null, p_proposal_id: data.proposalId || null });
  if (error || !id) redirect("/admin/dominios/nueva?error=save");
  revalidatePath("/admin/dominios");
  redirect(`/admin/dominios/${id}`);
}

export async function updateManagedWebsite(formData: FormData) {
  await requireAdmin();
  const input = websiteSchema.extend({ id: uuidSchema }).safeParse(Object.fromEntries(formData));
  if (!input.success) invalidAction();
  const data = input.data;
  if (!isDemoMode()) {
    const { error } = await (await createSessionClient()).from("managed_websites").update({ website_url: data.websiteUrl ? (/^https:\/\//i.test(data.websiteUrl) ? data.websiteUrl : `https://${data.websiteUrl}`) : null, activated_on: data.activatedOn || null, maintenance_monthly_cents: data.maintenanceMonthly ? cents(data.maintenanceMonthly) : null, notes: data.notes || null, updated_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error("No se han podido actualizar los datos de la web.");
  } else {
    const website = (await import("@/lib/domain-store")).demoWebsites().find((item) => item.id === data.id);
    if (website) {
      if (website.payments.length > 0 && website.activatedOn !== (data.activatedOn || undefined)) throw new Error("La fecha de activación está bloqueada porque ya hay cobros registrados.");
      Object.assign(website, { websiteUrl: data.websiteUrl || undefined, activatedOn: data.activatedOn || undefined, maintenanceMonthlyCents: data.maintenanceMonthly ? cents(data.maintenanceMonthly) : undefined, notes: data.notes || undefined });
    }
  }
  revalidatePath("/admin"); revalidatePath("/admin/dominios"); revalidatePath(`/admin/dominios/${data.id}`);
}

export async function archiveManagedWebsite(formData: FormData) {
  await requireAdmin(); const id = uuidSchema.parse(String(formData.get("id") || ""));
  if (!isDemoMode()) { const { error } = await (await createSessionClient()).from("managed_websites").update({ archived: true, deactivated_on: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq("id", id); if (error) throw new Error("No se ha podido archivar la web."); }
  else { const item = (await import("@/lib/domain-store")).demoWebsites().find((website) => website.id === id); if (item) item.archived = true; }
  revalidatePath("/admin"); revalidatePath("/admin/dominios"); redirect("/admin/dominios");
}

export async function saveManagedDomain(formData: FormData) {
  await requireAdmin(); const input = domainSchema.safeParse(Object.fromEntries(formData)); if (!input.success) invalidAction(); const data = input.data;
  const payload = { name: data.name.toLowerCase(), provider: data.provider || null, contracted_on: data.contractedOn || null, next_renewal_on: data.nextRenewalOn || null, auto_renew: data.autoRenew === "on", updated_at: new Date().toISOString() };
  if (!isDemoMode()) { const supabase = await createSessionClient(); const result = data.id ? await supabase.from("managed_domains").update(payload).eq("id", data.id) : await supabase.from("managed_domains").insert({ website_id: data.websiteId, ...payload }); if (result.error) throw new Error("No se ha podido guardar el dominio."); }
  else { const website = (await import("@/lib/domain-store")).demoWebsites().find((item) => item.id === data.websiteId); if (website) { const existing = data.id ? website.domains.find((domain) => domain.id === data.id) : null; if (existing) Object.assign(existing, { name: data.name.toLowerCase(), provider: data.provider || undefined, contractedOn: data.contractedOn || undefined, nextRenewalOn: data.nextRenewalOn || undefined, autoRenew: data.autoRenew === "on" }); else website.domains.push({ id: crypto.randomUUID(), websiteId: data.websiteId, name: data.name.toLowerCase(), provider: data.provider || undefined, contractedOn: data.contractedOn || undefined, nextRenewalOn: data.nextRenewalOn || undefined, autoRenew: data.autoRenew === "on", renewalStatus: "unknown" }); website.domainCount = website.domains.length; } }
  revalidatePath("/admin/dominios"); revalidatePath(`/admin/dominios/${data.websiteId}`);
}

export async function addDomainEvent(formData: FormData) {
  await requireAdmin(); const input = domainEventSchema.safeParse(Object.fromEntries(formData)); if (!input.success) invalidAction(); const data = input.data;
  if (!isDemoMode()) { const { error } = await (await createSessionClient()).from("domain_events").insert({ domain_id: data.domainId, event_type: data.eventType, event_date: data.eventDate, provider: data.provider || null, amount_cents: data.amount ? cents(data.amount) : null, notes: data.notes || null }); if (error) throw new Error("No se ha podido registrar el movimiento."); }
  revalidatePath("/admin/dominios");
}

export async function registerMaintenancePayment(formData: FormData) {
  await requireAdmin(); const input = paymentSchema.safeParse(Object.fromEntries(formData)); if (!input.success) invalidAction(); const data = input.data;
  const { periodsFor } = await import("@/lib/domains"); const periods = periodsFor(data.periodStart, data.monthsCovered);
  if (!isDemoMode()) { const { error } = await (await createSessionClient()).rpc("register_maintenance_payment", { p_website_id: data.websiteId, p_paid_on: data.paidOn, p_amount_cents: cents(data.amount), p_period_starts: periods.map((period) => period.periodStart), p_period_ends: periods.map((period) => period.periodEnd), p_notes: data.notes || null }); if (error) throw new Error(error.message.includes("PERIOD_ALREADY_PAID") ? "Uno de los meses seleccionados ya estaba pagado." : "No se ha podido registrar el cobro."); }
  else (await import("@/lib/domain-store")).addDemoPayment(data.websiteId, { id: crypto.randomUUID(), paidOn: data.paidOn, amountCents: cents(data.amount), periodStart: data.periodStart, monthsCovered: data.monthsCovered, notes: data.notes || undefined });
  revalidatePath("/admin"); revalidatePath("/admin/dominios"); revalidatePath(`/admin/dominios/${data.websiteId}`);
}

export async function voidMaintenancePayment(formData: FormData) {
  await requireAdmin(); const id = uuidSchema.parse(String(formData.get("id") || "")); const websiteId = uuidSchema.parse(String(formData.get("websiteId") || ""));
  if (!isDemoMode()) { const { error } = await (await createSessionClient()).rpc("void_maintenance_payment", { p_payment_id: id }); if (error) throw new Error("No se ha podido anular el cobro."); }
  else { const website = (await import("@/lib/domain-store")).demoWebsites().find((item) => item.id === websiteId); const payment = website?.payments.find((item) => item.id === id); if (payment) payment.voidedAt = new Date().toISOString(); }
  revalidatePath(`/admin/dominios/${websiteId}`);
}
