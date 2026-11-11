import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Brand } from "@/components/Brand";
import styles from "@/components/admin/Admin.module.css";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className={`${styles.shell} admin-shell`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand href="/admin" compact inverse />
          <form action={logoutAction}>
            <button className={styles.signout} type="submit">Cerrar sesión</button>
          </form>
        </div>
      </header>
      <div className={styles.layout}>
        <AdminNav />
        <main id="contenido" className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
