"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, sessionCookie } from "@/lib/auth";
import { parseEuros } from "@/lib/billing";
import * as db from "@/lib/db";

const text = (max = 300) => z.string().trim().max(max).default("");
const date = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida");
const optionalDate = z.union([z.literal(""), date]).default("").transform((value) => value || null);
const money = z.string().default("").transform((value, ctx) => {
  const cents = parseEuros(value);
  if (!Number.isFinite(cents) || cents < 0) {
    ctx.addIssue({ code: "custom", message: `Importe no válido: «${value}»` });
    return z.NEVER;
  }
  return cents;
});
const id = z.string().uuid();

function read(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function parse<T extends z.ZodType>(schema: T, formData: FormData, back: string): z.infer<T> {
  const result = schema.safeParse(read(formData));
  if (!result.success) redirect(`${back}?error=${encodeURIComponent(result.error.issues[0]?.message || "Datos no válidos")}`);
  return result.data;
}

// Todo el panel es dinámico; basta con invalidar el layout completo.
function done() {
  revalidatePath("/admin", "layout");
}

function backPath(formData: FormData, fallback: string) {
  const value = String(formData.get("back") || "");
  return /^\/admin(\/[\w-]+)*$/.test(value) ? value : fallback;
}

const siteSchema = z.object({
  name: text(120).pipe(z.string().min(1, "El nombre es obligatorio")),
  domain: text(253).transform((value) => value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")),
  url: text(500).refine((value) => !value || /^https?:\/\//.test(value), "La URL debe empezar por https://"),
  kind: z.enum(["informativa", "tienda", "hosting"]),
  startedOn: optionalDate,
  endedOn: optionalDate,
  monthly: money,
  setup: money,
  hosting: text(300),
  notes: text(4000),
});

function toSiteInput(data: z.infer<typeof siteSchema>): db.SiteInput {
  const { monthly, setup, ...rest } = data;
  return { ...rest, url: rest.url || (rest.domain ? `https://${rest.domain}` : ""), monthlyCents: monthly, setupCents: setup };
}

export async function createSiteAction(formData: FormData) {
  await requireAdmin();
  const data = parse(siteSchema, formData, "/admin/webs/nueva");
  const siteId = db.createSite(toSiteInput(data));
  done();
  redirect(`/admin/webs/${siteId}`);
}

export async function updateSiteAction(formData: FormData) {
  await requireAdmin();
  const siteId = id.parse(formData.get("id"));
  const data = parse(siteSchema, formData, `/admin/webs/${siteId}`);
  db.updateSite(siteId, toSiteInput(data));
  done();
  redirect(`/admin/webs/${siteId}?ok=Cambios+guardados`);
}

export async function archiveSiteAction(formData: FormData) {
  await requireAdmin();
  const siteId = id.parse(formData.get("id"));
  db.setSiteArchived(siteId, formData.get("archived") === "1");
  done();
}

export async function deleteSiteAction(formData: FormData) {
  await requireAdmin();
  db.deleteSite(id.parse(formData.get("id")));
  done();
  redirect("/admin/webs");
}

const domainSchema = z.object({
  id: z.union([z.literal(""), id]).default(""),
  siteId: id,
  name: text(253).pipe(z.string().min(3, "Indica el dominio")).transform((value) => value.toLowerCase()),
  registrar: text(120),
  renewsOn: optionalDate,
  yearly: money,
  autoRenew: z.string().optional(),
  notes: text(1000),
});

export async function saveDomainAction(formData: FormData) {
  await requireAdmin();
  const siteId = id.parse(formData.get("siteId"));
  const data = parse(domainSchema, formData, `/admin/webs/${siteId}`);
  db.saveDomain({ id: data.id || undefined, siteId, name: data.name, registrar: data.registrar, renewsOn: data.renewsOn, yearlyCents: data.yearly, autoRenew: data.autoRenew === "on", notes: data.notes });
  done();
}

export async function deleteDomainAction(formData: FormData) {
  await requireAdmin();
  db.deleteDomain(id.parse(formData.get("id")));
  done();
}

const costSchema = z.object({
  siteId: z.union([z.literal(""), id]).default("").transform((value) => value || null),
  concept: text(160).pipe(z.string().min(1, "Indica el concepto del coste")),
  provider: text(120),
  amount: money.refine((value) => value > 0, "El importe debe ser mayor que 0"),
  period: z.enum(["mensual", "anual", "unico"]),
  notes: text(1000),
});

export async function addCostAction(formData: FormData) {
  await requireAdmin();
  const data = parse(costSchema, formData, backPath(formData, "/admin/costes"));
  db.addCost({ siteId: data.siteId, concept: data.concept, provider: data.provider, amountCents: data.amount, period: data.period, notes: data.notes });
  done();
}

export async function deleteCostAction(formData: FormData) {
  await requireAdmin();
  db.deleteCost(id.parse(formData.get("id")));
  done();
}

const paymentSchema = z.object({
  siteId: id,
  paidOn: date,
  amount: money.refine((value) => value > 0, "El importe debe ser mayor que 0"),
  concept: z.enum(["desarrollo", "mantenimiento", "otro"]),
  notes: text(1000),
});

export async function addPaymentAction(formData: FormData) {
  await requireAdmin();
  const data = parse(paymentSchema, formData, backPath(formData, "/admin/cobros"));
  db.addPayment({ siteId: data.siteId, paidOn: data.paidOn, amountCents: data.amount, concept: data.concept, notes: data.notes });
  done();
}

export async function deletePaymentAction(formData: FormData) {
  await requireAdmin();
  db.deletePayment(id.parse(formData.get("id")));
  done();
}

export async function logoutAction() {
  (await cookies()).delete(sessionCookie);
  redirect("/admin/acceso");
}
