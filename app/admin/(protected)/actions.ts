"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie } from "@/lib/auth";

// El panel es de solo lectura: los datos se actualizan desde el servidor con scripts/db.mjs.
export async function logoutAction() {
  (await cookies()).delete(sessionCookie);
  redirect("/admin/acceso");
}
