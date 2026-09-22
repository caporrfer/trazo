import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const path = process.env.TRAZO_DB_PATH || (isBuild ? `.next/build-trazo-${process.pid}.sqlite` : "/data/trazo.sqlite");
mkdirSync(dirname(path), { recursive: true });
const db = new DatabaseSync(path);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS businesses (id TEXT PRIMARY KEY, name TEXT, business_type TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, business_id TEXT NOT NULL, slug TEXT UNIQUE, public_token TEXT NOT NULL UNIQUE, demo_url TEXT, form_version INTEGER NOT NULL DEFAULT 1, stage TEXT NOT NULL DEFAULT 'draft', commercial_status TEXT NOT NULL DEFAULT 'unclassified', is_active INTEGER NOT NULL DEFAULT 0, activated_at TEXT, sent_at TEXT, next_contact_at TEXT, archived_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL, request_id TEXT NOT NULL, form_version INTEGER NOT NULL, pricing_version INTEGER NOT NULL DEFAULT 1, answers TEXT NOT NULL, intent TEXT NOT NULL, impression TEXT, goal TEXT, selected_plan TEXT, respondent_name TEXT, relationship TEXT, decision_role TEXT, decline_reason TEXT, is_read INTEGER NOT NULL DEFAULT 0, followup_status TEXT NOT NULL DEFAULT 'none', created_at TEXT NOT NULL, UNIQUE(proposal_id,request_id));
CREATE TABLE IF NOT EXISTS response_contacts (response_id TEXT PRIMARY KEY, method TEXT NOT NULL, contact_value TEXT, preferred_time TEXT, preferred_datetime TEXT, relay_email TEXT);
CREATE TABLE IF NOT EXISTS domain_preferences (response_id TEXT PRIMARY KEY, status TEXT NOT NULL, current_domain TEXT, desired_domains TEXT NOT NULL DEFAULT '[]');
CREATE TABLE IF NOT EXISTS response_changes (response_id TEXT NOT NULL, category TEXT NOT NULL, PRIMARY KEY(response_id,category));
CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL, response_id TEXT, author_id TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS followups (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL, response_id TEXT, author_id TEXT NOT NULL, channel TEXT NOT NULL, result TEXT NOT NULL, contacted_at TEXT NOT NULL, next_contact_at TEXT);
CREATE TABLE IF NOT EXISTS rate_limit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, proposal_id TEXT NOT NULL, origin_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_users (user_id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS managed_websites (id TEXT PRIMARY KEY, business_id TEXT, proposal_id TEXT, website_url TEXT, activated_on TEXT, deactivated_on TEXT, maintenance_monthly_cents INTEGER, notes TEXT, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS managed_domains (id TEXT PRIMARY KEY, website_id TEXT NOT NULL, name TEXT NOT NULL, provider TEXT, contracted_on TEXT, next_renewal_on TEXT, auto_renew INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS domain_events (id TEXT PRIMARY KEY, domain_id TEXT NOT NULL, event_type TEXT NOT NULL, event_date TEXT NOT NULL, provider TEXT, amount_cents INTEGER, notes TEXT, file_path TEXT, file_name TEXT, file_mime TEXT, file_size INTEGER, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS maintenance_payments (id TEXT PRIMARY KEY, website_id TEXT NOT NULL, paid_on TEXT NOT NULL, amount_cents INTEGER NOT NULL, notes TEXT, voided_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS maintenance_payment_periods (id TEXT PRIMARY KEY, payment_id TEXT NOT NULL, website_id TEXT NOT NULL, period_start TEXT NOT NULL, period_end TEXT NOT NULL, UNIQUE(website_id,period_start));`);
const now = new Date().toISOString();
const seedBusiness = db.prepare("SELECT id FROM businesses WHERE id=?").get("11111111-1111-4111-8111-111111111111");
if (!seedBusiness) {
  db.prepare("INSERT INTO businesses(id,name,business_type,created_at,updated_at) VALUES(?,?,?,?,?)").run("11111111-1111-4111-8111-111111111111", "Restaurante Paco", "Restaurante", now, now);
  db.prepare("INSERT INTO proposals(id,business_id,slug,public_token,demo_url,stage,is_active,activated_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run("11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-111111111111", "restaurante-paco", "demo-seguro-trazo-2026", "https://example.com", "sent", 1, now, now, now);
}
function rows(table: string) {
  if (table === "proposals") return db.prepare(`SELECT p.*, json_object('name',b.name,'business_type',b.business_type) businesses FROM proposals p JOIN businesses b ON b.id=p.business_id`).all().map((r:any)=>({...r,is_active:Boolean(r.is_active),businesses:JSON.parse(r.businesses)})) as Record<string, unknown>[];
  if (table === "proposal_overview") return db.prepare(`SELECT p.*,b.name business_name,b.business_type,(SELECT count(*) FROM responses r WHERE r.proposal_id=p.id) response_count,(SELECT count(*) FROM responses r WHERE r.proposal_id=p.id AND r.is_read=0) unread_count,b.name business_search_name FROM proposals p JOIN businesses b ON b.id=p.business_id`).all() as Record<string, unknown>[];
  if (table === "response_overview") return db.prepare(`SELECT r.*,p.business_id,b.name business_name,co.method contact_method,co.contact_value FROM responses r JOIN proposals p ON p.id=r.proposal_id JOIN businesses b ON b.id=p.business_id LEFT JOIN response_contacts co ON co.response_id=r.id`).all() as Record<string, unknown>[];
  return db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
}
function normalize(v: unknown) { return String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
class Query implements PromiseLike<{data: any; error: any; count?: number}> {
  private filters: Array<(r: any) => boolean> = []; private sort?: {key:string; desc:boolean}; private bounds?: {from:number;to:number}; private mutation?: "insert"|"update"|"delete"; private payload: any;
  constructor(private table:string, private fields="*") {}
  select(fields="*", _options?: any) { this.fields=fields; return this; }
  eq(k:string,v:any){this.filters.push(r=>String(r[k]??"")===String(v));return this;} neq(k:string,v:any){this.filters.push(r=>String(r[k]??"")!==String(v));return this;}
  ilike(k:string,v:string){const q=normalize(v).replaceAll("%","");this.filters.push(r=>normalize(r[k]).includes(q));return this;} gte(k:string,v:any){this.filters.push(r=>String(r[k]??"")>=String(v));return this;} lte(k:string,v:any){this.filters.push(r=>String(r[k]??"")<=String(v));return this;}
  order(key:string,o:{ascending?:boolean}={}){this.sort={key,desc:o.ascending===false};return this;} range(from:number,to:number){this.bounds={from,to};return this;}
  insert(payload:any){this.mutation="insert";this.payload=payload;return this;} update(payload:any){this.mutation="update";this.payload=payload;return this;} delete(){this.mutation="delete";return this;}
  async maybeSingle(){const r=await this;return {data:r.data?.[0]||null,error:r.error};}
  then<TResult1=any,TResult2=never>(ok?:((v:any)=>TResult1|PromiseLike<TResult1>)|null,fail?:((e:any)=>TResult2|PromiseLike<TResult2>)|null){return Promise.resolve(this.run()).then(ok,fail);}
  private run(){try { const now=new Date().toISOString(); if(this.mutation==='insert'){const list=Array.isArray(this.payload)?this.payload:[this.payload]; for(const p of list){const id=p.id||randomUUID(); const item={id,created_at:p.created_at||now,updated_at:p.updated_at||now,...p}; const cols=Object.keys(item); db.prepare(`INSERT INTO ${this.table} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`).run(...(cols.map(c=>item[c]) as any[]));} return {data:null,error:null};}
    if(this.mutation==='update'||this.mutation==='delete'){const all=rows(this.table).filter(r=>this.filters.every(f=>f(r))); for(const r of all){if(this.mutation==='delete') db.prepare(`DELETE FROM ${this.table} WHERE id=?`).run((r as any).id); else {const p={...this.payload,updated_at:now}; const cols=Object.keys(p); db.prepare(`UPDATE ${this.table} SET ${cols.map(c=>`${c}=?`).join(',')} WHERE id=?`).run(...(cols.map(c=>p[c]) as any[]),(r as any).id);}} return {data:null,error:null};}
    let out=rows(this.table).filter(r=>this.filters.every(f=>f(r))); const count=out.length; if(this.sort) out.sort((a,b)=>String(a[this.sort!.key]??"").localeCompare(String(b[this.sort!.key]??""))*(this.sort!.desc?-1:1)); if(this.bounds) out=out.slice(this.bounds.from,this.bounds.to+1); return {data:out,error:null,count}; } catch(error:any){return {data:null,error};}}
}
class LocalClient { from(table:string): any {return new Query(table);} storage={from:(_bucket:string)=>({upload:async(_path:string,_file:unknown,_opts?:unknown)=>({error:null}),remove:async(_paths:string[])=>({error:null}),createSignedUrl:async(_path:string,_expires:number)=>({data:{signedUrl:""},error:null})})}; async rpc(name:string,args:any){try {const now=new Date().toISOString(); if(name==='create_proposal_with_business'){const bid=randomUUID(),pid=randomUUID();db.prepare('INSERT INTO businesses(id,name,business_type,created_at,updated_at) VALUES(?,?,?,?,?)').run(bid,args.p_business_name||null,args.p_business_type||null,now,now);db.prepare('INSERT INTO proposals(id,business_id,slug,public_token,demo_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(pid,bid,args.p_slug||null,args.p_public_token,args.p_demo_url||null,now,now);return {data:pid,error:null};} if(name==='create_managed_website'){const id=randomUUID();let businessId=args.p_business_id||null;if(!businessId&&args.p_proposal_id){const proposal=db.prepare('SELECT business_id FROM proposals WHERE id=?').get(args.p_proposal_id) as any;businessId=proposal?.business_id||null;}if(!businessId){businessId=randomUUID();db.prepare('INSERT INTO businesses(id,name,business_type,created_at,updated_at) VALUES(?,?,?,?,?)').run(businessId,args.p_business_name||'Cliente','Cliente',now,now);}db.prepare('INSERT INTO managed_websites(id,business_id,proposal_id,website_url,activated_on,maintenance_monthly_cents,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,businessId,args.p_proposal_id||null,args.p_website_url||null,args.p_activated_on||null,args.p_maintenance_monthly_cents||null,args.p_notes||null,now,now);return {data:id,error:null};} if(name==='register_followup'){db.prepare('INSERT INTO followups(id,proposal_id,response_id,author_id,channel,result,contacted_at,next_contact_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),args.p_proposal_id,args.p_response_id||null,'google-admin',args.p_channel,args.p_result,now,args.p_next_contact_at||null);return {data:null,error:null};} return {data:null,error:null};}catch(error:any){return {data:null,error};}} async getUser(){return {data:{user:null},error:null};} async signOut(){return {error:null};}}
const client=new LocalClient();
export async function createSessionClient(){return client;}
export function createServiceClient(){return client;}
