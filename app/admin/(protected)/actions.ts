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

function invalidAction(): never {
  throw new Error(
    "La solicitud no es válida. Recarga la página e inténtalo de nuevo.",
  );
}

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
