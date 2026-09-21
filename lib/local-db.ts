import "server-only";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool, type QueryResultRow } from "pg";

let pool: Pool | undefined;
let ready: Promise<void> | undefined;

function getPool() {
  return (pool ||= new Pool({ connectionString: process.env.DATABASE_URL || "postgres://trazo:trazo@db:5432/trazo", max: 10 }));
}

export async function ensureDatabase() {
  if (!ready) ready = (async () => { const sql = await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8"); await getPool().query(sql); })();
  await ready;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) { await ensureDatabase(); return getPool().query<T>(text, values); }

type Filter = { field: string; op: string; value: unknown };
function parseSelect(value: string) { return value.split(",").map((v) => v.trim()).filter(Boolean).map((v) => v === "*" ? "*" : v.replace(/\b([a-z_]+)\s*\(([^)]*)\)/gi, "$1($2)")); }

class LocalQuery<T extends QueryResultRow = QueryResultRow> implements PromiseLike<{ data: T[] | T | null; error: Error | null; count?: number }> {
  private filters: Filter[] = []; private orderBy = ""; private rangeBounds?: [number, number]; private op: "select" | "insert" | "update" | "delete" = "select"; private payload: Record<string, unknown> | Record<string, unknown>[] = {}; private columns = "*"; private wantsSingle = false; private countExact = false;
  constructor(private table: string) {}
  select(columns = "*", options?: { count?: string }) { this.columns = columns === "*" ? "*" : parseSelect(columns).join(", "); this.countExact = options?.count === "exact"; return this; }
  eq(field: string, value: unknown) { this.filters.push({ field, op: "=", value }); return this; }
  neq(field: string, value: unknown) { this.filters.push({ field, op: "<>", value }); return this; }
  ilike(field: string, value: unknown) { this.filters.push({ field, op: "ILIKE", value }); return this; }
  gte(field: string, value: unknown) { this.filters.push({ field, op: ">=", value }); return this; }
  lte(field: string, value: unknown) { this.filters.push({ field, op: "<=", value }); return this; }
  order(field: string, options?: { ascending?: boolean }) { this.orderBy = ` order by ${field} ${options?.ascending === false ? "desc" : "asc"}`; return this; }
  range(from: number, to: number) { this.rangeBounds = [from, to]; return this; }
  maybeSingle() { this.wantsSingle = true; return this; }
  single() { this.wantsSingle = true; return this; }
  insert(payload: Record<string, unknown> | Record<string, unknown>[]) { this.op = "insert"; this.payload = payload; return this; }
  update(payload: Record<string, unknown>) { this.op = "update"; this.payload = payload; return this; }
  delete() { this.op = "delete"; return this; }
  private where(offset = 1) { if (!this.filters.length) return { sql: "", values: [] as unknown[] }; return { sql: " where " + this.filters.map((f, i) => `${f.field} ${f.op} $${offset + i}`).join(" and "), values: this.filters.map((f) => f.value) }; }
  async run() {
    try {
      if (this.op === "insert") { const rows = Array.isArray(this.payload) ? this.payload : [this.payload]; const keys = Object.keys(rows[0] || {}); const vals: unknown[] = []; const tuples = rows.map((row) => `(${keys.map((k) => { vals.push(row[k]); return `$${vals.length}`; }).join(",")})`); const result = await query<T>(`insert into ${this.table} (${keys.join(",")}) values ${tuples.join(",")} returning *`, vals); return { data: result.rows as T[], error: null }; }
      const where = this.where(this.op === "select" ? 1 : Object.keys(this.payload as object).length + 1);
      if (this.op === "update") { const entries = Object.entries(this.payload as Record<string, unknown>); const vals = entries.map(([, v]) => v); const set = entries.map(([k], i) => `${k}=$${i + 1}`).join(","); const result = await query<T>(`update ${this.table} set ${set}${where.sql} returning *`, [...vals, ...where.values]); return { data: result.rows as T[], error: null }; }
      if (this.op === "delete") { await query(`delete from ${this.table}${where.sql}`, where.values); return { data: null, error: null }; }
      if (this.table === "managed_websites" && this.columns.includes("managed_domains")) {
        const base = await query<any>(`select mw.*, b.name business_name from managed_websites mw left join businesses b on b.id=mw.business_id${where.sql}${this.orderBy}${this.rangeBounds ? ` limit ${this.rangeBounds[1]-this.rangeBounds[0]+1} offset ${this.rangeBounds[0]}` : ""}`, where.values);
        for (const row of base.rows) { row.businesses = row.business_name ? { name: row.business_name } : null; row.managed_domains = (await query<any>("select * from managed_domains where website_id=$1", [row.id])).rows; for (const domain of row.managed_domains) domain.domain_events = (await query<any>("select * from domain_events where domain_id=$1", [domain.id])).rows; row.maintenance_payments = (await query<any>("select * from maintenance_payments where website_id=$1", [row.id])).rows; for (const payment of row.maintenance_payments) payment.maintenance_payment_periods = (await query<any>("select * from maintenance_payment_periods where payment_id=$1", [payment.id])).rows; }
        const rows = this.wantsSingle ? (base.rows[0] || null) : base.rows; return { data: rows, error: null };
      }
      const total = this.countExact ? (await query<{ count: string }>(`select count(*)::text count from ${this.table}${where.sql}`, where.values)).rows[0]?.count : undefined;
      const range = this.rangeBounds ? ` limit ${this.rangeBounds[1] - this.rangeBounds[0] + 1} offset ${this.rangeBounds[0]}` : "";
      const result = await query<T>(`select ${this.columns} from ${this.table}${where.sql}${this.orderBy}${range}`, where.values); const rows = this.wantsSingle ? (result.rows[0] || null) : result.rows; return { data: rows as T[] | T | null, error: null, count: total ? Number(total) : undefined };
    } catch (error) { return { data: null, error: error as Error }; }
  }
  then<TResult1 = { data: T[] | T | null; error: Error | null; count?: number }, TResult2 = never>(onfulfilled?: ((value: { data: T[] | T | null; error: Error | null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) { return this.run().then(onfulfilled, onrejected); }
}

export function localClient() { return { from: (table: string) => new LocalQuery(table), rpc: localRpc }; }
export async function createSessionClient() { await ensureDatabase(); return localClient(); }
export function createServiceClient() { return localClient(); }

async function localRpc(name: string, args: Record<string, unknown>) {
  try {
    if (name === "create_proposal_with_business") { const b = await query<{ id: string }>("insert into businesses(name,business_type) values($1,$2) returning id", [args.p_business_name || null, args.p_business_type || null]); const p = await query<{ id: string }>("insert into proposals(business_id,slug,public_token,demo_url) values($1,$2,$3,$4) returning id", [b.rows[0].id, args.p_slug || null, args.p_public_token, args.p_demo_url || null]); return { data: p.rows[0].id, error: null }; }
    if (name === "update_proposal_details") { await query("update businesses set name=$1,business_type=$2,updated_at=now() where id=(select business_id from proposals where id=$3)", [args.p_business_name || null,args.p_business_type || null,args.p_proposal_id]); await query("update proposals set slug=$1,demo_url=$2,updated_at=now() where id=$3", [args.p_slug || null,args.p_demo_url || null,args.p_proposal_id]); return { data: null, error: null }; }
    if (name === "register_followup") { const admin = await ensureAdmin(); const r = await query<{ id: string }>("insert into followups(proposal_id,response_id,author_id,channel,result,next_contact_at) values($1,$2,$3,$4,$5,$6) returning id", [args.p_proposal_id,args.p_response_id || null,admin,args.p_channel,args.p_result,args.p_next_contact_at || null]); if (args.p_response_id) await query("update responses set followup_status='attended' where id=$1", [args.p_response_id]); await query("update proposals set next_contact_at=$1,commercial_status='contacted' where id=$2", [args.p_next_contact_at || null,args.p_proposal_id]); return { data: r.rows[0].id, error: null }; }
    if (name === "create_managed_website") { let business = args.p_business_id as string | null; if (!business && args.p_proposal_id) business = (await query<{business_id:string}>("select business_id from proposals where id=$1",[args.p_proposal_id])).rows[0]?.business_id || null; if (!business) business = (await query<{id:string}>("insert into businesses(name,business_type) values($1,'Cliente') returning id",[args.p_business_name])).rows[0].id; const r = await query<{id:string}>("insert into managed_websites(business_id,proposal_id,website_url,activated_on,maintenance_monthly_cents,notes) values($1,$2,$3,$4,$5,$6) returning id",[business,args.p_proposal_id||null,args.p_website_url||null,args.p_activated_on||null,args.p_maintenance_monthly_cents||null,args.p_notes||null]); return {data:r.rows[0].id,error:null}; }
    if (name === "register_maintenance_payment") { const r = await query<{id:string}>("insert into maintenance_payments(website_id,paid_on,amount_cents,notes) values($1,$2,$3,$4) returning id",[args.p_website_id,args.p_paid_on,args.p_amount_cents,args.p_notes||null]); const starts = args.p_period_starts as string[]; const ends = args.p_period_ends as string[]; for (let i=0;i<starts.length;i++) await query("insert into maintenance_payment_periods(payment_id,website_id,period_start,period_end) values($1,$2,$3,$4)",[r.rows[0].id,args.p_website_id,starts[i],ends[i]]); return {data:r.rows[0].id,error:null}; }
    if (name === "void_maintenance_payment") { await query("update maintenance_payments set voided_at=coalesce(voided_at,now()) where id=$1",[args.p_payment_id]); return {data:null,error:null}; }
    if (name === "submit_proposal_response") return submitResponse(args);
    return { data: null, error: new Error(`Unknown RPC ${name}`) };
  } catch (error) { return { data: null, error: error as Error }; }
}

async function ensureAdmin() { const email = process.env.ADMIN_EMAIL || "admin@trazo.local"; const r = await query<{id:string}>("insert into admin_users(email) values($1) on conflict(email) do update set email=excluded.email returning id",[email]); return r.rows[0].id; }
async function submitResponse(args: Record<string, unknown>) { const proposal = (await query<{is_active:boolean;stage:string;form_version:number}>("select is_active,stage,form_version from proposals where id=$1",[args.p_proposal_id])).rows[0]; if (!proposal || !proposal.is_active || proposal.stage === "archived") return {data:null,error:new Error("INACTIVE_PROPOSAL")}; if (proposal.form_version !== args.p_form_version) return {data:null,error:new Error("FORM_VERSION_MISMATCH")}; const existing = (await query<{id:string}>("select id from responses where proposal_id=$1 and request_id=$2",[args.p_proposal_id,args.p_request_id])).rows[0]; if (existing) return {data:{id:existing.id,duplicate:true},error:null}; const count = (await query<{count:string}>("select count(*)::text count from rate_limit_events where origin_hash=$1 and created_at>now()-interval '10 minutes'",[args.p_ip_hash])).rows[0]; if (Number(count.count)>=10) return {data:null,error:new Error("RATE_LIMIT")}; await query("insert into rate_limit_events(proposal_id,origin_hash) values($1,$2)",[args.p_proposal_id,args.p_ip_hash]); const payload=args.p_payload as Record<string,any>; const r=await query<{id:string}>("insert into responses(proposal_id,request_id,form_version,answers,intent,impression,goal,selected_plan,respondent_name,relationship,decision_role,decline_reason,followup_status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id",[args.p_proposal_id,args.p_request_id,args.p_form_version,JSON.stringify(payload),payload.intent,payload.impression||null,payload.goal||null,payload.plan||null,payload.respondentName||null,payload.relationship||null,payload.decisionRole||null,payload.declineReason||null,["information","changes","talk","demo_help"].includes(payload.intent)?"pending":"none"]); const id=r.rows[0].id; if(payload.contactMethod) await query("insert into response_contacts(response_id,method,contact_value,preferred_time,preferred_datetime,relay_email) values($1,$2,$3,$4,$5,$6)",[id,payload.contactMethod,payload.contactValue||null,payload.contactTime||null,payload.preferredDateTime||null,payload.relayEmail||null]); if(payload.domainStatus) await query("insert into domain_preferences(response_id,status,current_domain,desired_domains) values($1,$2,$3,$4)",[id,payload.domainStatus,payload.currentDomain||null,payload.desiredDomains||[]]); for(const category of payload.changes||[]) await query("insert into response_changes(response_id,category) values($1,$2) on conflict do nothing",[id,category]); return {data:{id,duplicate:false},error:null}; }

export function hashSession(token: string) { return createHash("sha256").update(token).digest("hex"); }
