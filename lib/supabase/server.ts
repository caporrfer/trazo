import { createClient } from "@supabase/supabase-js";

/**
 * Puente temporal de datos durante la migración a SQLite.
 * La autorización de usuario se realiza en lib/auth.ts con la sesión Google
 * propia; este cliente sólo se invoca desde código server-side protegido.
 */
export async function createSessionClient() {
  return createServiceClient();
}

export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}
