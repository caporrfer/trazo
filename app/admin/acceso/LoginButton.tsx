"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginButton() {
  const [error, setError] = useState("");
  async function signIn() {
    setError("");
    const origin = window.location.origin;
    const { error: authError } =
      await createBrowserSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/admin`,
          queryParams: { prompt: "select_account" },
        },
      });
    if (authError)
      setError("No hemos podido iniciar el acceso. Inténtalo de nuevo.");
  }
  return (
    <>
      <button className="button button-primary" type="button" onClick={signIn}>
        Continuar con Google
      </button>
      {error && (
        <p className="error-notice notice" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
