"use client";

import { FileText, LayoutDashboard, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/propuestas", label: "Propuestas", icon: FileText },
  { href: "/admin/respuestas", label: "Respuestas", icon: MessageSquareText },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Administración">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            className={active ? styles.navActive : undefined}
            href={href}
            aria-current={active ? "page" : undefined}
            key={href}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
