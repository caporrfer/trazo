import { z } from "zod";
import type { FormAnswers } from "./types";
import { isDecline, requiresContact, shouldAskDomain } from "./flow";

const answerSchema = z.object({
  viewed: z.enum(["reviewed", "skimmed", "not_yet"]),
  impression: z
    .enum(["like", "changes", "more_info", "no_fit", "no_need"])
    .optional(),
  fitClarification: z.enum(["new_approach", "finish"]).optional(),
  changes: z
    .array(
      z.enum([
        "design",
        "photos",
        "texts",
        "structure",
        "menu",
        "reservations",
        "orders",
        "whatsapp",
        "languages",
        "other",
      ]),
    )
    .max(10),
  changesNote: z.string().trim().max(800).optional(),
  intent: z.enum([
    "information",
    "changes",
    "talk",
    "share",
    "opinion",
    "demo_help",
    "decline",
  ]),
  goal: z
    .enum([
      "reservations",
      "menu",
      "orders",
      "messages",
      "image",
      "google",
      "advice",
    ])
    .optional(),
  plan: z
    .enum(["hosting", "updates", "development", "advice", "not_yet"])
    .optional(),
  domainStatus: z.enum(["existing", "wanted", "help", "undecided"]).optional(),
  currentDomain: z.string().trim().max(253).optional(),
  desiredDomains: z.array(z.string().trim().max(253)).max(3),
  respondentName: z.string().trim().max(100).optional(),
  relationship: z
    .enum(["owner", "manager", "marketing", "staff", "other"])
    .optional(),
  decisionRole: z.enum(["decision", "shared", "relay", "unsure"]).optional(),
  contactMethod: z.enum(["whatsapp", "phone", "email", "relay"]).optional(),
  contactValue: z.string().trim().max(180).optional(),
  contactTime: z
    .enum(["morning", "afternoon", "anytime", "specific", "write_first"])
    .optional(),
  preferredDateTime: z.string().max(40).optional(),
  declineReason: z
    .enum([
      "has_site",
      "not_priority",
      "style",
      "not_useful",
      "price",
      "other",
      "prefer_not",
    ])
    .optional(),
  declineNote: z.string().trim().max(500).optional(),
  relayEmail: z.string().trim().email().max(180).or(z.literal("")).optional(),
});

export const submissionSchema = z
  .object({
    requestId: z.string().uuid(),
    formVersion: z.number().int().positive(),
    company: z.string().max(0).optional(),
    answers: answerSchema,
  })
  .superRefine((value, ctx) => {
    const a = value.answers as FormAnswers;
    if (a.viewed === "not_yet" && a.intent !== "demo_help")
      ctx.addIssue({
        code: "custom",
        path: ["answers", "intent"],
        message: "Indica si necesitas ayuda para abrir la propuesta.",
      });
    if (a.viewed !== "not_yet" && a.intent === "demo_help")
      ctx.addIssue({
        code: "custom",
        path: ["answers", "intent"],
        message:
          "La ayuda para abrir la propuesta solo corresponde si todavía no has podido verla.",
      });
    const declineByEvaluation =
      a.impression === "no_need" ||
      (a.impression === "no_fit" && a.fitClarification === "finish");
    if (declineByEvaluation && a.intent !== "decline")
      ctx.addIssue({
        code: "custom",
        path: ["answers", "intent"],
        message:
          "La respuesta de desinterés no coincide con el recorrido mostrado.",
      });
    if (!declineByEvaluation && a.intent === "decline")
      ctx.addIssue({
        code: "custom",
        path: ["answers", "intent"],
        message: "La respuesta no coincide con el recorrido mostrado.",
      });
    if (a.viewed !== "not_yet" && !a.impression)
      ctx.addIssue({
        code: "custom",
        path: ["answers", "impression"],
        message: "Indica qué te ha parecido la propuesta.",
      });
    if (a.impression === "no_fit" && !a.fitClarification)
      ctx.addIssue({
        code: "custom",
        path: ["answers", "fitClarification"],
        message: "Indica cómo te gustaría continuar.",
      });
    if (requiresContact(a)) {
      if (!a.contactMethod)
        ctx.addIssue({
          code: "custom",
          path: ["answers", "contactMethod"],
          message: "Elige cómo prefieres que contactemos.",
        });
      if (
        a.contactMethod &&
        a.contactMethod !== "relay" &&
        !a.contactValue?.trim()
      )
        ctx.addIssue({
          code: "custom",
          path: ["answers", "contactValue"],
          message: "Escribe el dato de contacto correspondiente.",
        });
      if (
        a.contactMethod === "email" &&
        a.contactValue &&
        !z.string().email().safeParse(a.contactValue).success
      )
        ctx.addIssue({
          code: "custom",
          path: ["answers", "contactValue"],
          message: "Escribe un correo electrónico válido.",
        });
      if (
        ["phone", "whatsapp"].includes(a.contactMethod || "") &&
        a.contactValue &&
        !/^[+()\d\s.-]{6,30}$/.test(a.contactValue)
      )
        ctx.addIssue({
          code: "custom",
          path: ["answers", "contactValue"],
          message: "Escribe un número de teléfono válido.",
        });
      if (a.contactTime === "write_first" && a.contactMethod === "phone")
        ctx.addIssue({
          code: "custom",
          path: ["answers", "contactMethod"],
          message:
            "Para escribirte primero, elige WhatsApp o correo electrónico.",
        });
      if (a.contactTime === "specific" && !a.preferredDateTime)
        ctx.addIssue({
          code: "custom",
          path: ["answers", "preferredDateTime"],
          message: "Indica el día y la hora aproximados.",
        });
    }
    if (
      shouldAskDomain(a) &&
      a.domainStatus === "existing" &&
      !a.currentDomain?.trim()
    )
      ctx.addIssue({
        code: "custom",
        path: ["answers", "currentDomain"],
        message: "Escribe vuestro dominio actual.",
      });
    if (
      shouldAskDomain(a) &&
      a.domainStatus === "wanted" &&
      !a.desiredDomains.some(Boolean)
    )
      ctx.addIssue({
        code: "custom",
        path: ["answers", "desiredDomains"],
        message: "Escribe al menos una opción de dominio.",
      });
    if (isDecline(a) && !a.intent)
      ctx.addIssue({
        code: "custom",
        path: ["answers", "intent"],
        message: "No hemos podido determinar el tipo de respuesta.",
      });
  });

export function validateStep(step: string, a: FormAnswers): string | null {
  if (step === "viewed" && !a.viewed) return "Elige una opción para continuar.";
  if (step === "demoHelp" && !a.intent)
    return "Abre la propuesta o solicita ayuda para continuar.";
  if (step === "impression" && !a.impression)
    return "Elige la opción que mejor refleje tu opinión.";
  if (step === "fit" && !a.fitClarification)
    return "Elige cómo te gustaría continuar.";
  if (step === "intent" && !a.intent)
    return "Elige cómo te gustaría continuar.";
  if (
    step === "domain" &&
    a.domainStatus === "existing" &&
    !a.currentDomain?.trim()
  )
    return "Escribe vuestro dominio actual.";
  if (
    step === "domain" &&
    a.domainStatus === "wanted" &&
    !a.desiredDomains.some((value) => value.trim())
  )
    return "Escribe al menos una opción de dominio.";
  if (
    step === "person" &&
    a.relayEmail &&
    !z.string().email().safeParse(a.relayEmail).success
  )
    return "Escribe un correo profesional válido o deja el campo vacío.";
  if (step === "contact" && requiresContact(a) && !a.contactMethod)
    return "Elige un medio de contacto.";
  if (
    step === "contact" &&
    a.contactMethod &&
    a.contactMethod !== "relay" &&
    !a.contactValue?.trim()
  )
    return "Escribe el dato de contacto correspondiente.";
  if (
    step === "contact" &&
    a.contactMethod === "email" &&
    !z.string().email().safeParse(a.contactValue).success
  )
    return "Escribe un correo electrónico válido.";
  if (
    step === "contact" &&
    ["phone", "whatsapp"].includes(a.contactMethod || "") &&
    a.contactValue &&
    !/^[+()\d\s.-]{6,30}$/.test(a.contactValue)
  )
    return "Escribe un número de teléfono válido.";
  if (
    step === "contact" &&
    a.contactTime === "write_first" &&
    a.contactMethod === "phone"
  )
    return "Para escribirte primero, elige WhatsApp o correo electrónico.";
  if (
    step === "contact" &&
    a.contactTime === "specific" &&
    !a.preferredDateTime
  )
    return "Indica el día y la hora aproximados.";
  return null;
}
