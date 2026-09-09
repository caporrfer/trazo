import { FileText, LayoutDashboard, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
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
          <Link className="brand" href="/admin">
            <span className="brand-mark" aria-hidden="true">
              t
            </span>
            Trazo
          </Link>
          <div className={styles.account}>
            <span>{admin.email}</span>
            <SignOutButton demo={admin.demo} />
          </div>
        </div>
      </header>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Administración">
          <Link href="/admin" aria-label="Resumen">
            <LayoutDashboard aria-hidden="true" />
            <span>Resumen</span>
          </Link>
          <Link href="/admin/propuestas" aria-label="Propuestas">
            <FileText aria-hidden="true" />
            <span>Propuestas</span>
          </Link>
          <Link href="/admin/respuestas" aria-label="Respuestas">
            <MessageSquareText aria-hidden="true" />
            <span>Respuestas</span>
          </Link>
        </nav>
        <main id="contenido" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
