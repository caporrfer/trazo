"use client";

import { useEffect, useState } from "react";
import styles from "./Admin.module.css";

export function ResponsiveFilters({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(active);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 561px)");
    const sync = () => setOpen(desktop.matches || active);
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, [active]);

  return (
    <details
      className={styles.filterDetails}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}
