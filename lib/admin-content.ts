import type {
  CommercialStatus,
  ContactMethod,
  Impression,
  Intent,
  Plan,
  ProposalStage,
} from "./types";

export const intentLabels: Record<Intent, string> = {
  information: "Información",
  changes: "Cambios",
  talk: "Hablar con Trazo",
  share: "Trasladar",
  opinion: "Opinión",
  demo_help: "Ayuda con la demo",
  decline: "No continúa",
};
export const planLabels: Record<Plan, string> = {
  hosting: "Web + alojamiento",
  updates: "Web + actualizaciones",
  development: "Solo desarrollo",
  advice: "Necesita asesoramiento",
  not_yet: "Todavía no elige",
};
export const stageLabels: Record<ProposalStage, string> = {
  draft: "Borrador",
  prepared: "Preparada",
  sent: "Enviada",
  archived: "Archivada",
};
export const commercialLabels: Record<CommercialStatus, string> = {
  unclassified: "Sin clasificar",
  pending_contact: "Pendiente de contactar",
  contacted: "Contactada",
  waiting: "Esperando respuesta",
  interested: "Interesada",
  client: "Cliente",
  not_interested: "No interesada",
};
export const impressionLabels: Record<Impression, string> = {
  like: "Le gusta",
  changes: "Solicita cambios",
  more_info: "Necesita información",
  no_fit: "No encaja",
  no_need: "No necesita web",
};
export const contactLabels: Record<ContactMethod, string> = {
  whatsapp: "WhatsApp",
  phone: "Llamada",
  email: "Correo",
  relay: "Trasladar al responsable",
};
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

export function formatCalendarDate(value?: string) {
  if (!value) return "Sin indicar";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeZone: "Europe/Madrid" }).format(new Date(`${value}T12:00:00Z`));
}

export function formatEuroCents(value?: number) {
  if (value === undefined || value === null) return "Sin indicar";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value / 100);
}
