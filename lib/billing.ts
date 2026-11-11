import { anniversaryDate, parseDate } from "./domains";

export type SiteKind = "informativa" | "tienda" | "hosting";
export type CostPeriod = "mensual" | "anual" | "unico";
export type PaymentConcept = "desarrollo" | "mantenimiento" | "otro";

export interface BillableSite {
  startedOn?: string | null;
  endedOn?: string | null;
  monthlyCents: number;
  setupCents: number;
}

function todayUtc(today: Date) {
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
}

/**
 * Mensualidades ya devengadas: la cuota se cobra al inicio de cada periodo,
 * así que el día de alta ya cuenta como un mes. Si la web se dio de baja,
 * no se generan periodos que empiecen ese día o después.
 */
export function monthsBilled(site: Pick<BillableSite, "startedOn" | "endedOn">, today = new Date()) {
  if (!site.startedOn) return 0;
  const now = todayUtc(today);
  const end = site.endedOn ? parseDate(site.endedOn) : null;
  let months = 0;
  for (;;) {
    const periodStart = parseDate(anniversaryDate(site.startedOn, months));
    if (periodStart > now) break;
    if (end && periodStart >= end) break;
    months += 1;
    if (months > 1200) break;
  }
  return months;
}

export function siteBalance(site: BillableSite, paidCents: number, today = new Date()) {
  const months = monthsBilled(site, today);
  const accruedCents = (site.startedOn ? site.setupCents : 0) + months * site.monthlyCents;
  return { months, accruedCents, paidCents, pendingCents: accruedCents - paidCents };
}

export function nextChargeOn(site: Pick<BillableSite, "startedOn" | "endedOn">, today = new Date()) {
  if (!site.startedOn || site.endedOn) return undefined;
  return anniversaryDate(site.startedOn, monthsBilled(site, today));
}

export function monthlyEquivalentCents(amountCents: number, period: CostPeriod) {
  if (period === "mensual") return amountCents;
  if (period === "anual") return Math.round(amountCents / 12);
  return 0;
}

export function parseEuros(value: string) {
  const clean = value.trim().replace(/\s|€/g, "");
  if (!clean) return 0;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Math.round(Number(normalized) * 100);
}

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export function formatEuros(cents: number) {
  return euro.format(cents / 100);
}

const longDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export function formatDate(value?: string | null) {
  return value ? longDate.format(parseDate(value)) : "—";
}

const monthName = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
export function formatMonth(yyyyMm: string) {
  const label = monthName.format(parseDate(`${yyyyMm}-01`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const kindLabels: Record<SiteKind, string> = {
  informativa: "Web informativa",
  tienda: "Tienda online",
  hosting: "Solo hosting",
};
export const periodLabels: Record<CostPeriod, string> = { mensual: "Mensual", anual: "Anual", unico: "Pago único" };
export const conceptLabels: Record<PaymentConcept, string> = { desarrollo: "Desarrollo", mantenimiento: "Mantenimiento", otro: "Otro" };
