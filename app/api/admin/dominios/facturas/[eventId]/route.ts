import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/local-db";
export async function GET(_request:Request,{params}:{params:Promise<{eventId:string}>}) { await requireAdmin(); const {eventId}=await params; const row=(await query<{file_path:string;file_mime:string;file_name:string}>("select file_path,file_mime,file_name from domain_events where id=$1",[eventId])).rows[0]; if(!row?.file_path) return new Response("Not found",{status:404}); try { const file=await readFile(path.join(process.env.TRAZO_STORAGE_DIR||path.join(process.cwd(),"data","invoices"),row.file_path)); return new Response(file,{headers:{"content-type":row.file_mime||"application/octet-stream","content-disposition":`attachment; filename="${row.file_name||"factura"}"`}}); } catch { return new Response("Not found",{status:404}); } }
