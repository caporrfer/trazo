import type { ManagedDomain, ManagedWebsite } from "./types";

const dayMs = 86_400_000;

export function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function dateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function anniversaryDate(start: string, months: number) {
  const original = parseDate(start);
  const year = original.getUTCFullYear();
  const month = original.getUTCMonth() + months;
  const day = original.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return dateString(new Date(Date.UTC(year, month, Math.min(day, lastDay))));
}

export function periodEnd(start: string) {
  return anniversaryDate(start, 1);
}

export function periodsFor(start: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const periodStart = anniversaryDate(start, index);
    return { periodStart, periodEnd: periodEnd(periodStart) };
  });
}

export function activeMetrics(website: Pick<ManagedWebsite, "activatedOn" | "deactivatedOn">, today = new Date()) {
  if (!website.activatedOn) return {};
  const end = website.deactivatedOn ? parseDate(website.deactivatedOn) : new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const start = parseDate(website.activatedOn);
  const activeDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / dayMs));
  let completeMonths = 0;
  while (parseDate(anniversaryDate(website.activatedOn, completeMonths + 1)) <= end) completeMonths += 1;
  const remainderStart = parseDate(anniversaryDate(website.activatedOn, completeMonths));
  const remainingDays = Math.max(0, Math.floor((end.getTime() - remainderStart.getTime()) / dayMs));
  return { activeDays, completeMonths, remainingDays };
}

export function renewalStatus(nextRenewalOn?: string, today = new Date()): ManagedDomain["renewalStatus"] {
  if (!nextRenewalOn) return "unknown";
  const current = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const days = Math.ceil((parseDate(nextRenewalOn).getTime() - current.getTime()) / dayMs);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 30) return "soon";
  return "active";
}

export function daysToRenewal(nextRenewalOn?: string, today = new Date()) {
  if (!nextRenewalOn) return undefined;
  const current = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return Math.ceil((parseDate(nextRenewalOn).getTime() - current.getTime()) / dayMs);
}
