"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearFailures, encodeSession, loginBlocked, passwordConfigured, recordFailure, sessionCookie, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!passwordConfigured()) return { error: "El acceso no está configurado en el servidor." };
  const ip = await clientIp();
  if (loginBlocked(ip)) return { error: "Demasiados intentos fallidos. Espera 15 minutos y vuelve a probar." };
  const password = String(formData.get("password") || "");
  if (!password || password.length > 200 || !verifyPassword(password)) {
    recordFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Contraseña incorrecta." };
  }
  clearFailures(ip);
  (await cookies()).set(sessionCookie, encodeSession(), sessionCookieOptions);
  redirect("/admin");
}
