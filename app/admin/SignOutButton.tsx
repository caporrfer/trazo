"use client";

import { useRouter } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";

export function SignOutButton({ demo }: { demo: boolean }) {
  const router = useRouter();
  return (
    <button
      className={styles.signout}
      type="button"
      onClick={async () => {
        if (!demo) await fetch("/auth/signout", { method: "POST" });
        router.push("/admin/acceso");
        router.refresh();
      }}
    >
      Cerrar sesión
    </button>
  );
}
