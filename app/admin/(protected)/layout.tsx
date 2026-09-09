import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Brand } from "@/components/Brand";
import styles from "@/components/admin/Admin.module.css";
import { SignOutButton } from "../SignOutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <div className={styles.shell}>
      {admin.demo && (
        <aside className={styles.demoBanner}>
          Modo de demostración local: configura Supabase para guardar datos
          reales.
        </aside>
      )}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand href="/admin" compact inverse />
          <div className={styles.account}>
            <span>{admin.email}</span>
            <SignOutButton demo={admin.demo} />
          </div>
        </div>
      </header>
      <div className={styles.layout}>
        <AdminNav />
        <main id="contenido" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
