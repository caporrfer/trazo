"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { login } from "./actions";
import styles from "./Login.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className={styles.form}>
      <label className={styles.label} htmlFor="password">Contraseña</label>
      <div className={`${styles.field} ${state?.error ? styles.fieldError : ""}`}>
        <LockKeyhole className={styles.fieldIcon} size={19} aria-hidden="true" />
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          maxLength={200}
          aria-invalid={Boolean(state?.error)}
          aria-describedby={state?.error ? "login-error" : undefined}
        />
        <button className={styles.reveal} type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
      {state?.error && <p id="login-error" className={styles.error} role="alert">{state.error}</p>}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
