import { demoAdminProposals, demoProposal } from "./demo-data";
import { demoResponses } from "./demo-store";
import type { AdminProposal, AdminResponse, ProposalPublic } from "./types";
import { hasSupabaseConfig, isDemoMode } from "./supabase/config";
import { createServiceClient, createSessionClient } from "./supabase/server";

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
    token: String(row.public_token),
    demoUrl: String(row.demo_url),
    active: Boolean(row.is_active),
    formVersion: Number(row.form_version || 1),
  };
}

export async function getPublicProposal(
  slug: string,
  token: string,
): Promise<ProposalPublic | null> {
  if (
    (!hasSupabaseConfig() || isDemoMode()) &&
    slug === demoProposal.slug &&
    token === demoProposal.token
  )
    return demoProposal;
  if (!hasSupabaseConfig()) return null;
  const { data } = await createServiceClient()
    .from("proposals")
    .select(
      "id,slug,public_token,demo_url,is_active,form_version,businesses(name,business_type)",
    )
    .eq("slug", slug)
    .eq("public_token", token)
    .eq("is_active", true)
    .maybeSingle();
  return data ? mapProposal(data as unknown as Record<string, unknown>) : null;
}

export async function listAdminProposals(): Promise<AdminProposal[]> {
  if (isDemoMode() || !hasSupabaseConfig()) {
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
    token: row.public_token,
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
    knownContactName: row.known_contact_name || undefined,
    knownContactEmail: row.known_contact_email || undefined,
    knownContactPhone: row.known_contact_phone || undefined,
  }));
}

export async function listAdminResponses(): Promise<AdminResponse[]> {
  if (isDemoMode() || !hasSupabaseConfig()) return demoResponses();
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
  if (isDemoMode() || !hasSupabaseConfig()) {
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
    token: row.public_token,
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
    knownContactName: row.known_contact_name || undefined,
    knownContactEmail: row.known_contact_email || undefined,
    knownContactPhone: row.known_contact_phone || undefined,
  })) as AdminProposal[];
  return { items: mapped, total: count || 0, ...bounds };
}

export async function searchAdminResponses(filters: ResponseFilters) {
  const bounds = pageBounds(filters.page, filters.pageSize);
  if (isDemoMode() || !hasSupabaseConfig()) {
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
  if (isDemoMode() || !hasSupabaseConfig())
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
  if (isDemoMode() || !hasSupabaseConfig())
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
