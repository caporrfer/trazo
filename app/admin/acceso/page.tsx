import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { hasSupabaseConfig, isDemoMode } from "@/lib/supabase/config";
import { LoginButton } from "./LoginButton";

export const metadata = {
  title: "Acceso a administración",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  const configured = hasSupabaseConfig();
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          Trazo
        </div>
        <p className="eyebrow">Administración privada</p>
        <h1>Accede al panel de propuestas</h1>
        <p className="lead">
          Solo la cuenta de Google autorizada puede consultar y modificar la
          información.
        </p>
        {configured ? (
          <LoginButton />
        ) : (
          <p className="notice">
            El acceso estará disponible cuando se configuren las variables de
            Supabase y la cuenta administradora.
          </p>
        )}
        {isDemoMode() && (
          <a className="button button-secondary" href="/admin">
            Abrir dashboard de demostración
          </a>
        )}
      </div>
    </main>
  );
}
