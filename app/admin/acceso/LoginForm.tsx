"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="login-form">
      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus maxLength={200} />
      {state?.error && <p className="notice error-notice" role="alert">{state.error}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
