import type { Metadata } from "next";
import { LogOut } from "lucide-react";
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
          <Brand href="/admin" compact />
          <AdminNav />
          <form action={logoutAction}>
            <button className={styles.signout} type="submit" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>
      <main id="contenido" className={styles.main}>{children}</main>
    </div>
  );
}
