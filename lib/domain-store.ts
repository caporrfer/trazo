import type { ManagedWebsite, MaintenancePayment } from "./types";
import { activeMetrics, daysToRenewal, renewalStatus } from "./domains";

const demoWebsiteId = "55555555-5555-4555-8555-555555555555";
const demoDomainId = "66666666-6666-4666-8666-666666666666";

const seed: ManagedWebsite[] = [{
  id: demoWebsiteId,
  businessId: "11111111-1111-4111-8111-111111111111",
  proposalId: "11111111-1111-4111-8111-111111111111",
  businessName: "Restaurante Paco",
  websiteUrl: "https://restaurante-paco.es",
  activatedOn: "2025-09-16",
  maintenanceMonthlyCents: 3900,
  notes: "Mantenimiento y dominio gestionados por Trazo.",
  archived: false,
  domainCount: 1,
  domains: [{ id: demoDomainId, websiteId: demoWebsiteId, name: "restaurante-paco.es", provider: "DonDominio", contractedOn: "2025-09-16", nextRenewalOn: "2026-09-16", autoRenew: true, renewalStatus: "unknown", daysToRenewal: 0, lastCostCents: 1299 }],
  payments: [{ id: "77777777-7777-4777-8777-777777777777", paidOn: "2026-01-16", amountCents: 11700, periodStart: "2025-09-16", monthsCovered: 3, notes: "Pago trimestral" }],
  paidMonths: 3,
  pendingMonths: 9,
  totalPaidCents: 11700,
}];

declare global { var __trazoManagedWebsites: ManagedWebsite[] | undefined; }

function enrich(item: ManagedWebsite): ManagedWebsite {
  const metrics = activeMetrics(item);
  const paidMonths = item.payments.filter((payment) => !payment.voidedAt).reduce((sum, payment) => sum + payment.monthsCovered, 0);
  return { ...item, ...metrics, paidMonths, pendingMonths: Math.max(0, (metrics.completeMonths || 0) - paidMonths), totalPaidCents: item.payments.filter((payment) => !payment.voidedAt).reduce((sum, payment) => sum + payment.amountCents, 0), domains: item.domains.map((domain) => ({ ...domain, renewalStatus: renewalStatus(domain.nextRenewalOn), daysToRenewal: daysToRenewal(domain.nextRenewalOn) })) };
}

export function demoWebsites() {
  if (!globalThis.__trazoManagedWebsites) globalThis.__trazoManagedWebsites = seed.map(enrich);
  return globalThis.__trazoManagedWebsites;
}

export function addDemoWebsite(item: ManagedWebsite) { demoWebsites().unshift(enrich(item)); }
export function addDemoPayment(websiteId: string, payment: MaintenancePayment) { const website = demoWebsites().find((item) => item.id === websiteId); if (website) { website.payments.unshift(payment); Object.assign(website, enrich(website)); } }
