import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { getAdmin } from "@/lib/auth";
import { googleConfigured } from "@/lib/auth";
import { LoginButton } from "./LoginButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Acceso a administración",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  const configured = googleConfigured();
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Brand />
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
            El acceso estará disponible cuando se configuren las variables de Google y la cuenta administradora.
          </p>
        )}
        {process.env.NODE_ENV !== "production" && process.env.DEMO_MODE === "true" && (
          <a className="button button-secondary" href="/admin">
            Abrir dashboard de demostración
          </a>
        )}
      </div>
    </main>
  );
}
