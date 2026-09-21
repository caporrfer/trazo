/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  demoAdminProposals,
  demoProposal,
  demoProposalToken,
} from "./demo-data";
import { demoResponses } from "./demo-store";
import type { AdminProposal, AdminResponse, ProposalPublic } from "./types";
import type { ManagedWebsite, ManagedDomain, MaintenancePayment } from "./types";
import { activeMetrics, daysToRenewal, renewalStatus } from "./domains";
import { demoWebsites } from "./domain-store";
import { hasLocalConfig, isDemoMode } from "./local-config";
import { createServiceClient, createSessionClient } from "./db-client";

function mapProposal(row: Record<string, unknown>): ProposalPublic {
  const business = row.businesses as {
    name?: string;
    business_type?: string;
  } | null;
  return {
    id: String(row.id),
    businessName: business?.name || "Negocio",
    businessType: business?.business_type || "Negocio",
    slug: String(row.slug),
    demoUrl: String(row.demo_url),
    active: Boolean(row.is_active),
    formVersion: Number(row.form_version || 1),
  };
}

export async function getPublicProposal(
  slug: string,
): Promise<ProposalPublic | null> {
  if (isDemoMode() && slug === demoProposal.slug) return demoProposal;
  if (!hasLocalConfig()) return null;
  const { data } = await createServiceClient()
    .from("proposals")
    .select(
      "id,slug,demo_url,is_active,form_version,businesses(name,business_type)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .neq("stage", "archived")
    .maybeSingle();
  return data ? mapProposal(data as unknown as Record<string, unknown>) : null;
}

export async function getLegacyPublicProposal(
  slug: string,
  token: string,
): Promise<ProposalPublic | null> {
  if (
    isDemoMode() &&
    slug === demoProposal.slug &&
    token === demoProposalToken
  )
    return demoProposal;
  if (!hasLocalConfig()) return null;
  const { data } = await createServiceClient()
    .from("proposals")
    .select(
      "id,slug,demo_url,is_active,form_version,businesses(name,business_type)",
    )
    .eq("slug", slug)
    .eq("public_token", token)
    .eq("is_active", true)
    .neq("stage", "archived")
    .maybeSingle();
  return data ? mapProposal(data as unknown as Record<string, unknown>) : null;
}

export async function listAdminProposals(): Promise<AdminProposal[]> {
  if (isDemoMode() || !hasLocalConfig()) {
    const responses = demoResponses();
    return demoAdminProposals.map((proposal) => ({
      ...proposal,
      responseCount: responses.filter((item) => item.proposalId === proposal.id)
        .length,
      unreadCount: responses.filter(
        (item) => item.proposalId === proposal.id && item.unread,
      ).length,
    }));
  }
  const { data, error } = await (await createSessionClient())
    .from("proposal_overview")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    businessName: row.business_name || "Borrador sin nombre",
    businessType: row.business_type || "Tipo pendiente",
    slug: row.slug || "",
    demoUrl: row.demo_url || "",
    active: row.is_active,
    formVersion: row.form_version,
    stage: row.stage,
    commercialStatus: row.commercial_status,
    createdAt: row.created_at,
    sentAt: row.sent_at || undefined,
    nextContactAt: row.next_contact_at || undefined,
    responseCount: Number(row.response_count),
    unreadCount: Number(row.unread_count),
  }));
}

export async function listAdminResponses(): Promise<AdminResponse[]> {
  if (isDemoMode() || !hasLocalConfig()) return demoResponses();
  const { data, error } = await (await createSessionClient())
    .from("response_overview")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    proposalId: row.proposal_id,
    businessName: row.business_name,
    createdAt: row.created_at,
    intent: row.intent,
    impression: row.impression || undefined,
    plan: row.selected_plan || undefined,
    respondentName: row.respondent_name || undefined,
    contactMethod: row.contact_method || undefined,
    contactValue: row.contact_value || undefined,
    unread: !row.is_read,
    followupStatus: row.followup_status,
    answers: row.answers,
  }));
}

export interface ProposalFilters {
  q?: string;
  stage?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ResponseFilters {
  q?: string;
  intent?: string;
  plan?: string;
  read?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

function pageBounds(page = 1, pageSize = 20) {
  const safePage = Math.max(1, Math.trunc(page));
  const safeSize = Math.min(100, Math.max(1, Math.trunc(pageSize)));
  return {
    from: (safePage - 1) * safeSize,
    to: safePage * safeSize - 1,
    page: safePage,
    pageSize: safeSize,
  };
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export async function searchAdminProposals(filters: ProposalFilters) {
  const bounds = pageBounds(filters.page, filters.pageSize);
  if (isDemoMode() || !hasLocalConfig()) {
    let items = await listAdminProposals();
    if (filters.q)
      items = items.filter((item) =>
        item.businessName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("es")
          .includes(normalizeSearch(filters.q!)),
      );
    if (filters.stage)
      items = items.filter((item) => item.stage === filters.stage);
    if (filters.status)
      items = items.filter((item) => item.commercialStatus === filters.status);
    return {
      items: items.slice(bounds.from, bounds.to + 1),
      total: items.length,
      ...bounds,
    };
  }
  let query = (await createSessionClient())
    .from("proposal_overview")
    .select("*", { count: "exact" });
  if (filters.q)
    query = query.ilike(
      "business_search_name",
      `%${normalizeSearch(filters.q).replaceAll("%", "\\%").replaceAll("_", "\\_")}%`,
    );
  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.status) query = query.eq("commercial_status", filters.status);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(bounds.from, bounds.to);
  if (error) throw error;
  const mapped = (data || []).map((row) => ({
    id: row.id,
    businessName: row.business_name || "Borrador sin nombre",
    businessType: row.business_type || "Tipo pendiente",
    slug: row.slug || "",
    demoUrl: row.demo_url || "",
    active: row.is_active,
    formVersion: row.form_version,
    stage: row.stage,
    commercialStatus: row.commercial_status,
    createdAt: row.created_at,
    sentAt: row.sent_at || undefined,
    nextContactAt: row.next_contact_at || undefined,
    responseCount: Number(row.response_count),
    unreadCount: Number(row.unread_count),
  })) as AdminProposal[];
  return { items: mapped, total: count || 0, ...bounds };
}

export async function searchAdminResponses(filters: ResponseFilters) {
  const bounds = pageBounds(filters.page, filters.pageSize);
  if (isDemoMode() || !hasLocalConfig()) {
    let items = await listAdminResponses();
    if (filters.q)
      items = items.filter((item) =>
        item.businessName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("es")
          .includes(normalizeSearch(filters.q!)),
      );
    if (filters.intent)
      items = items.filter((item) => item.intent === filters.intent);
    if (filters.plan)
      items = items.filter((item) => item.plan === filters.plan);
    if (filters.read === "new") items = items.filter((item) => item.unread);
    if (filters.read === "pending")
      items = items.filter((item) => item.followupStatus === "pending");
    if (filters.from)
      items = items.filter(
        (item) => item.createdAt >= `${filters.from}T00:00:00.000Z`,
      );
    if (filters.to)
      items = items.filter(
        (item) => item.createdAt <= `${filters.to}T23:59:59.999Z`,
      );
    return {
      items: items.slice(bounds.from, bounds.to + 1),
      total: items.length,
      ...bounds,
    };
  }
  let query = (await createSessionClient())
    .from("response_overview")
    .select("*", { count: "exact" });
  if (filters.q)
    query = query.ilike(
      "business_search_name",
      `%${normalizeSearch(filters.q).replaceAll("%", "\\%").replaceAll("_", "\\_")}%`,
    );
  if (filters.intent) query = query.eq("intent", filters.intent);
  if (filters.plan) query = query.eq("selected_plan", filters.plan);
  if (filters.read === "new") query = query.eq("is_read", false);
  if (filters.read === "pending")
    query = query.eq("followup_status", "pending");
  if (filters.from)
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to)
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(bounds.from, bounds.to);
  if (error) throw error;
  const mapped = (data || []).map((row) => ({
    id: row.id,
    proposalId: row.proposal_id,
    businessName: row.business_name,
    createdAt: row.created_at,
    intent: row.intent,
    impression: row.impression || undefined,
    plan: row.selected_plan || undefined,
    respondentName: row.respondent_name || undefined,
    contactMethod: row.contact_method || undefined,
    contactValue: row.contact_value || undefined,
    unread: !row.is_read,
    followupStatus: row.followup_status,
    answers: row.answers,
  })) as AdminResponse[];
  return { items: mapped, total: count || 0, ...bounds };
}

export async function getAdminProposal(id: string) {
  const proposals = await listAdminProposals();
  return proposals.find((item) => item.id === id) || null;
}

export async function getAdminResponse(id: string) {
  const responses = await listAdminResponses();
  return responses.find((item) => item.id === id) || null;
}

export async function listAdminNotes(proposalId: string) {
  if (isDemoMode() || !hasLocalConfig())
    return [] as {
      id: string;
      body: string;
      createdAt: string;
      responseId?: string;
    }[];
  const { data, error } = await (await createSessionClient())
    .from("notes")
    .select("id,body,created_at,response_id")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((item) => ({
    id: item.id,
    body: item.body,
    createdAt: item.created_at,
    responseId: item.response_id || undefined,
  }));
}

export async function listAdminFollowups(proposalId: string) {
  if (isDemoMode() || !hasLocalConfig())
    return [] as {
      id: string;
      channel: string;
      result: string;
      contactedAt: string;
      nextContactAt?: string;
    }[];
  const { data, error } = await (await createSessionClient())
    .from("followups")
    .select("id,channel,result,contacted_at,next_contact_at")
    .eq("proposal_id", proposalId)
    .order("contacted_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((item) => ({
    id: item.id,
    channel: item.channel,
    result: item.result,
    contactedAt: item.contacted_at,
    nextContactAt: item.next_contact_at || undefined,
  }));
}

function mapManagedWebsite(row: Record<string, any>): ManagedWebsite {
  const domains: ManagedDomain[] = (row.managed_domains || []).map((domain: any) => {
    const events = domain.domain_events || [];
    const latest = [...events].sort((a, b) => String(b.event_date).localeCompare(String(a.event_date)))[0];
    return {
      id: domain.id, websiteId: domain.website_id, name: domain.name,
      provider: domain.provider || undefined, contractedOn: domain.contracted_on || undefined,
      nextRenewalOn: domain.next_renewal_on || undefined, autoRenew: Boolean(domain.auto_renew),
      renewalStatus: renewalStatus(domain.next_renewal_on), daysToRenewal: daysToRenewal(domain.next_renewal_on),
      lastCostCents: latest?.amount_cents || undefined,
      events: events.map((event: any) => ({ id: event.id, eventType: event.event_type, eventDate: event.event_date, provider: event.provider || undefined, amountCents: event.amount_cents || undefined, notes: event.notes || undefined, fileId: event.file_path ? event.id : undefined, fileName: event.file_name || undefined })),
    };
  });
  const payments: MaintenancePayment[] = (row.maintenance_payments || []).map((payment: any) => {
    const first = [...(payment.maintenance_payment_periods || [])].sort((a, b) => String(a.period_start).localeCompare(String(b.period_start)))[0];
    return { id: payment.id, paidOn: payment.paid_on, amountCents: payment.amount_cents, periodStart: first?.period_start || "", monthsCovered: (payment.maintenance_payment_periods || []).length, notes: payment.notes || undefined, voidedAt: payment.voided_at || undefined };
  });
  const website = { id: row.id, businessId: row.business_id || undefined, proposalId: row.proposal_id || undefined, businessName: row.businesses?.name || "Cliente sin nombre", websiteUrl: row.website_url || undefined, activatedOn: row.activated_on || undefined, deactivatedOn: row.deactivated_on || undefined, maintenanceMonthlyCents: row.maintenance_monthly_cents ?? undefined, notes: row.notes || undefined, archived: Boolean(row.archived), domainCount: domains.length, domains, payments, paidMonths: 0, pendingMonths: 0, totalPaidCents: 0 } satisfies ManagedWebsite;
  const metrics = activeMetrics(website);
  const paidMonths = payments.filter((payment) => !payment.voidedAt).reduce((sum, payment) => sum + payment.monthsCovered, 0);
  return { ...website, ...metrics, paidMonths, pendingMonths: Math.max(0, (metrics.completeMonths || 0) - paidMonths), totalPaidCents: payments.filter((payment) => !payment.voidedAt).reduce((sum, payment) => sum + payment.amountCents, 0) };
}

export async function listAdminWebsites(filters: { q?: string; pending?: boolean; renewal?: boolean } = {}) {
  if (isDemoMode() || !hasLocalConfig()) {
    let items = demoWebsites().filter((item) => !item.archived);
    if (filters.q) { const q = normalizeSearch(filters.q); items = items.filter((item) => normalizeSearch(item.businessName).includes(q) || item.domains.some((domain) => normalizeSearch(domain.name).includes(q))); }
    if (filters.pending) items = items.filter((item) => item.pendingMonths > 0);
    if (filters.renewal) items = items.filter((item) => item.domains.some((domain) => ["soon", "today", "overdue"].includes(domain.renewalStatus)));
    return items;
  }
  let query = (await createSessionClient()).from("managed_websites").select("*, businesses(name), managed_domains(*, domain_events(*)), maintenance_payments(*, maintenance_payment_periods(*))").eq("archived", false).order("created_at", { ascending: false });
  if (filters.q) query = query.ilike("businesses.name", `%${normalizeSearch(filters.q).replaceAll("%", "\\%").replaceAll("_", "\\_")}%`);
  const { data, error } = await query;
  if (error) throw error;
  let items = (data || []).map((row) => mapManagedWebsite(row as Record<string, any>));
  if (filters.pending) items = items.filter((item) => item.pendingMonths > 0);
  if (filters.renewal) items = items.filter((item) => item.domains.some((domain) => ["soon", "today", "overdue"].includes(domain.renewalStatus)));
  return items;
}

export async function getAdminWebsite(id: string) {
  if (isDemoMode() || !hasLocalConfig()) return demoWebsites().find((item) => item.id === id) || null;
  const { data, error } = await (await createSessionClient()).from("managed_websites").select("*, businesses(name), managed_domains(*, domain_events(*)), maintenance_payments(*, maintenance_payment_periods(*))").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapManagedWebsite(data as Record<string, any>) : null;
}
