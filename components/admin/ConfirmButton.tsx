"use client";

import { useState } from "react";
import styles from "./Admin.module.css";

/** Botón de borrado en dos pasos: el primer clic pide confirmación. */
export function ConfirmButton({ label = "Borrar", confirm = "Sí, borrar" }: { label?: string; confirm?: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return <button className={styles.linkDanger} type="button" onClick={() => setArmed(true)}>{label}</button>;
  }
  return (
    <span className={styles.confirm}>
      <button className={styles.linkDanger} type="submit">{confirm}</button>
      <button className={styles.link} type="button" onClick={() => setArmed(false)}>Cancelar</button>
    </span>
  );
}
