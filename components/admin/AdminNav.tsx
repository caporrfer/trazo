"use client";

import { Globe2, LayoutDashboard, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/webs", label: "Webs", icon: Globe2 },
  { href: "/admin/cobros", label: "Cobros", icon: Wallet },
  { href: "/admin/costes", label: "Costes", icon: Receipt },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Administración">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link className={active ? styles.navActive : undefined} href={href} aria-current={active ? "page" : undefined} key={href}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
