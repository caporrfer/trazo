import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import styles from "./Login.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="contenido" className={`${styles.page} admin-shell`}>
      <div className={styles.card}>
        <Brand />
        <div className={styles.heading}>
          <p className={styles.kicker}>Área privada</p>
          <h1>Panel de gestión</h1>
          <p className={styles.sub}>Webs, dominios y cobros de nuestros clientes.</p>
        </div>
        {passwordConfigured() ? (
          <LoginForm />
        ) : (
          <p className="notice">Falta configurar ADMIN_PASSWORD_HASH y AUTH_SESSION_SECRET en el servidor.</p>
        )}
      </div>
      <Link className={styles.back} href="/">← Volver a la web</Link>
    </main>
  );
}
