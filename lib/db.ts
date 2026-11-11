import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { monthlyEquivalentCents, siteBalance, type CostPeriod, type PaymentConcept, type SiteKind } from "./billing";
import { daysToRenewal, renewalStatus } from "./domains";

export interface Site {
  id: string;
  name: string;
  domain: string;
  url: string;
  kind: SiteKind;
  startedOn: string | null;
  endedOn: string | null;
  monthlyCents: number;
  setupCents: number;
  hosting: string;
  notes: string;
  archived: boolean;
}
export interface Domain {
  id: string;
  siteId: string;
  name: string;
  registrar: string;
  renewsOn: string | null;
  yearlyCents: number;
  autoRenew: boolean;
  notes: string;
}
export interface Cost {
  id: string;
  siteId: string | null;
  concept: string;
  provider: string;
  amountCents: number;
  period: CostPeriod;
  notes: string;
}
export interface Payment {
  id: string;
  siteId: string;
  paidOn: string;
  amountCents: number;
  concept: PaymentConcept;
  notes: string;
}

const LEGACY_TABLES = [
  "maintenance_payment_periods", "maintenance_payments", "domain_events", "managed_domains", "managed_websites",
  "admin_users", "rate_limit_events", "followups", "notes", "response_changes", "domain_preferences",
  "response_contacts", "responses", "proposals", "businesses",
];

function open() {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const path = process.env.TRAZO_DB_PATH || (isBuild ? `.next/build-trazo-${process.pid}.sqlite` : "/data/trazo.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'informativa', started_on TEXT, ended_on TEXT,
  monthly_cents INTEGER NOT NULL DEFAULT 0, setup_cents INTEGER NOT NULL DEFAULT 0,
  hosting TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY, site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE, name TEXT NOT NULL,
  registrar TEXT NOT NULL DEFAULT '', renews_on TEXT, yearly_cents INTEGER NOT NULL DEFAULT 0,
  auto_renew INTEGER NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS costs (
  id TEXT PRIMARY KEY, site_id TEXT REFERENCES sites(id) ON DELETE CASCADE, concept TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT '', amount_cents INTEGER NOT NULL, period TEXT NOT NULL DEFAULT 'mensual',
  notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE, paid_on TEXT NOT NULL,
  amount_cents INTEGER NOT NULL, concept TEXT NOT NULL DEFAULT 'mantenimiento', notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS payments_site ON payments(site_id, paid_on);`);
  migrateLegacy(db);
  seed(db);
  return db;
}

function tableExists(db: DatabaseSync, name: string) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name));
}

function transaction(db: DatabaseSync, fn: () => void) {
  db.exec("BEGIN IMMEDIATE");
  try { fn(); db.exec("COMMIT"); } catch (error) { db.exec("ROLLBACK"); throw error; }
}

type Row = Record<string, unknown>;
const str = (value: unknown) => (value === null || value === undefined ? "" : String(value));
const opt = (value: unknown) => (value === null || value === undefined || value === "" ? null : String(value));

/** Pasa las webs del panel antiguo (managed_websites) al modelo nuevo y elimina las tablas de propuestas. */
function migrateLegacy(db: DatabaseSync) {
  if (!tableExists(db, "managed_websites") && !tableExists(db, "proposals")) return;
  const now = new Date().toISOString();
  transaction(db, () => {
    if (tableExists(db, "managed_websites")) {
      const hasBusinesses = tableExists(db, "businesses");
      const websites = db.prepare(`SELECT w.*, ${hasBusinesses ? "b.name" : "NULL"} AS business_name FROM managed_websites w ${hasBusinesses ? "LEFT JOIN businesses b ON b.id = w.business_id" : ""}`).all() as Row[];
      for (const website of websites) {
        if (db.prepare("SELECT 1 FROM sites WHERE id=?").get(str(website.id))) continue;
        const domains = (tableExists(db, "managed_domains") ? db.prepare("SELECT * FROM managed_domains WHERE website_id=?").all(str(website.id)) : []) as Row[];
        const url = str(website.website_url);
        const host = domains[0] ? str(domains[0].name) : url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
        const isIbhola = /ibhola/i.test(`${url} ${host} ${str(website.business_name)}`);
        db.prepare(`INSERT INTO sites (id,name,domain,url,kind,started_on,ended_on,monthly_cents,setup_cents,hosting,notes,archived,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          str(website.id),
          str(website.business_name) || host || "Web sin nombre",
          isIbhola ? "ibholahuelva.es" : host,
          url || (host ? `https://${host}` : ""),
          "informativa",
          opt(website.activated_on),
          opt(website.deactivated_on),
          Number(website.maintenance_monthly_cents ?? (isIbhola ? 2900 : 0)),
          isIbhola ? 30000 : 0,
          isIbhola ? "VPS propio (contenedor ibhola-web)" : "",
          str(website.notes),
          Number(website.archived ?? 0),
          str(website.created_at) || now,
          now,
        );
        for (const domain of domains) {
          const lastCost = tableExists(db, "domain_events")
            ? (db.prepare("SELECT amount_cents FROM domain_events WHERE domain_id=? AND amount_cents IS NOT NULL ORDER BY event_date DESC LIMIT 1").get(str(domain.id)) as Row | undefined)
            : undefined;
          db.prepare("INSERT OR IGNORE INTO domains (id,site_id,name,registrar,renews_on,yearly_cents,auto_renew,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(
            str(domain.id), str(website.id), str(domain.name).toLowerCase(), str(domain.provider), opt(domain.next_renewal_on),
            Number(lastCost?.amount_cents ?? 0), Number(domain.auto_renew ?? 0), domain.contracted_on ? `Contratado el ${str(domain.contracted_on)}` : "", now,
          );
        }
        if (tableExists(db, "maintenance_payments")) {
          const payments = db.prepare("SELECT * FROM maintenance_payments WHERE website_id=? AND voided_at IS NULL").all(str(website.id)) as Row[];
          for (const payment of payments) {
            db.prepare("INSERT OR IGNORE INTO payments (id,site_id,paid_on,amount_cents,concept,notes,created_at) VALUES (?,?,?,?,?,?,?)").run(
              str(payment.id), str(website.id), str(payment.paid_on), Number(payment.amount_cents), "mantenimiento", str(payment.notes), str(payment.created_at) || now,
            );
          }
        }
      }
    }
    for (const table of LEGACY_TABLES) db.exec(`DROP TABLE IF EXISTS ${table}`);
  });
}

/** Datos de partida. Se ejecuta una sola vez para no recrear webs que se borren después. */
function seed(db: DatabaseSync) {
  if (db.prepare("SELECT 1 FROM meta WHERE key='seed_v1'").get()) return;
  const now = new Date().toISOString();
  transaction(db, () => {
    const insert = db.prepare(`INSERT INTO sites (id,name,domain,url,kind,started_on,monthly_cents,setup_cents,hosting,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    if (!db.prepare("SELECT 1 FROM sites WHERE domain='ibholahuelva.es'").get()) {
      insert.run(randomUUID(), "Ibhola Huelva", "ibholahuelva.es", "https://www.ibholahuelva.es", "informativa", null, 2900, 30000,
        "VPS propio (contenedor ibhola-web)", "Falta indicar la fecha de alta del servicio.", now, now);
    }
    if (!db.prepare("SELECT 1 FROM sites WHERE domain='cerezopilates.es'").get()) {
      insert.run(randomUUID(), "Cerezo Pilates", "cerezopilates.es", "https://cerezopilates.es", "hosting", "2026-11-11", 3900, 0,
        "VPS propio (contenedor cerezo-pilates-web)", "Solo servicio de hosting.", now, now);
    }
    db.prepare("INSERT INTO meta (key,value) VALUES ('seed_v1', ?)").run(now);
  });
}

declare global {
  var __trazoDb: DatabaseSync | undefined;
}
function db() {
  if (!globalThis.__trazoDb) globalThis.__trazoDb = open();
  return globalThis.__trazoDb;
}

const mapSite = (r: Row): Site => ({
  id: str(r.id), name: str(r.name), domain: str(r.domain), url: str(r.url), kind: str(r.kind) as SiteKind,
  startedOn: opt(r.started_on), endedOn: opt(r.ended_on), monthlyCents: Number(r.monthly_cents), setupCents: Number(r.setup_cents),
  hosting: str(r.hosting), notes: str(r.notes), archived: Boolean(r.archived),
});
const mapDomain = (r: Row): Domain => ({
  id: str(r.id), siteId: str(r.site_id), name: str(r.name), registrar: str(r.registrar), renewsOn: opt(r.renews_on),
  yearlyCents: Number(r.yearly_cents), autoRenew: Boolean(r.auto_renew), notes: str(r.notes),
});
const mapCost = (r: Row): Cost => ({
  id: str(r.id), siteId: opt(r.site_id), concept: str(r.concept), provider: str(r.provider), amountCents: Number(r.amount_cents),
  period: str(r.period) as CostPeriod, notes: str(r.notes),
});
const mapPayment = (r: Row): Payment => ({
  id: str(r.id), siteId: str(r.site_id), paidOn: str(r.paid_on), amountCents: Number(r.amount_cents),
  concept: str(r.concept) as PaymentConcept, notes: str(r.notes),
});

export type SiteSummary = Site & ReturnType<typeof siteBalance> & { domains: Domain[]; monthlyCostCents: number };

function summarize(site: Site, domains: Domain[], costs: Cost[], paidCents: number): SiteSummary {
  const monthlyCostCents = costs.reduce((sum, cost) => sum + monthlyEquivalentCents(cost.amountCents, cost.period), 0)
    + domains.reduce((sum, domain) => sum + monthlyEquivalentCents(domain.yearlyCents, "anual"), 0);
  return { ...site, ...siteBalance(site, paidCents), domains, monthlyCostCents };
}

export function listSites({ includeArchived = false } = {}): SiteSummary[] {
  const sites = (db().prepare(`SELECT * FROM sites ${includeArchived ? "" : "WHERE archived=0"} ORDER BY archived, name COLLATE NOCASE`).all() as Row[]).map(mapSite);
  const domains = (db().prepare("SELECT * FROM domains ORDER BY name").all() as Row[]).map(mapDomain);
  const costs = (db().prepare("SELECT * FROM costs WHERE site_id IS NOT NULL").all() as Row[]).map(mapCost);
  const paid = new Map((db().prepare("SELECT site_id, SUM(amount_cents) total FROM payments GROUP BY site_id").all() as Row[]).map((r) => [str(r.site_id), Number(r.total)]));
  return sites.map((site) => summarize(site, domains.filter((d) => d.siteId === site.id), costs.filter((c) => c.siteId === site.id), paid.get(site.id) ?? 0));
}

export function getSite(id: string) {
  const row = db().prepare("SELECT * FROM sites WHERE id=?").get(id) as Row | undefined;
  if (!row) return null;
  const site = mapSite(row);
  const domains = (db().prepare("SELECT * FROM domains WHERE site_id=? ORDER BY name").all(id) as Row[]).map(mapDomain);
  const costs = (db().prepare("SELECT * FROM costs WHERE site_id=? ORDER BY concept").all(id) as Row[]).map(mapCost);
  const payments = (db().prepare("SELECT * FROM payments WHERE site_id=? ORDER BY paid_on DESC, created_at DESC").all(id) as Row[]).map(mapPayment);
  const paid = payments.reduce((sum, p) => sum + p.amountCents, 0);
  return { ...summarize(site, domains, costs, paid), costs, payments };
}

export function listCosts() {
  return (db().prepare("SELECT c.* FROM costs c LEFT JOIN sites s ON s.id=c.site_id ORDER BY s.name IS NOT NULL, s.name, c.concept").all() as Row[]).map(mapCost);
}

export function listPayments(siteId?: string) {
  const sql = `SELECT * FROM payments ${siteId ? "WHERE site_id=?" : ""} ORDER BY paid_on DESC, created_at DESC`;
  const rows = (siteId ? db().prepare(sql).all(siteId) : db().prepare(sql).all()) as Row[];
  return rows.map(mapPayment);
}

export function upcomingRenewals(withinDays = 60) {
  const sites = new Map(listSites().map((site) => [site.id, site]));
  return (db().prepare("SELECT * FROM domains WHERE renews_on IS NOT NULL ORDER BY renews_on").all() as Row[])
    .map(mapDomain)
    .filter((domain) => sites.has(domain.siteId))
    .map((domain) => ({ ...domain, siteName: sites.get(domain.siteId)!.name, days: daysToRenewal(domain.renewsOn!) ?? 0, status: renewalStatus(domain.renewsOn!) }))
    .filter((domain) => domain.days <= withinDays);
}
