import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Brand />
        <p className="eyebrow">Panel privado</p>
        <h1>Gestión de webs</h1>
        {passwordConfigured() ? (
          <LoginForm />
        ) : (
          <p className="notice">Falta configurar ADMIN_PASSWORD_HASH y AUTH_SESSION_SECRET en el servidor.</p>
        )}
      </div>
    </main>
  );
}
