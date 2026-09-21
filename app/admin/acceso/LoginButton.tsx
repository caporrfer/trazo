"use client";

import { useState } from "react";

export function LoginButton() {
  const [error, setError] = useState("");
  async function signIn() {
    setError("");
    window.location.assign("/auth/google");
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
