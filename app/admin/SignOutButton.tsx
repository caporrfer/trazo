"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import styles from "@/components/admin/Admin.module.css";

export function SignOutButton({ demo }: { demo: boolean }) {
  const router = useRouter();
  return (
    <button
      className={styles.signout}
      type="button"
      onClick={async () => {
        if (!demo) await createBrowserSupabase().auth.signOut();
        router.push("/admin/acceso");
        router.refresh();
      }}
    >
      Cerrar sesión
    </button>
  );
}
