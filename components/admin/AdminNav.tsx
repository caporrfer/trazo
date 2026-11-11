"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/webs", label: "Webs" },
  { href: "/admin/cobros", label: "Cobros" },
  { href: "/admin/costes", label: "Costes" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Secciones del panel">
      {links.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link className={active ? styles.navActive : undefined} href={href} aria-current={active ? "page" : undefined} key={href}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
