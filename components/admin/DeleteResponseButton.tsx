"use client";

import { useState } from "react";
import { deleteResponse } from "@/app/admin/(protected)/actions";

export function DeleteResponseButton({
  id,
  businessName,
}: {
  id: string;
  businessName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming)
    return (
      <button
        className="button button-danger"
        type="button"
        onClick={() => setConfirming(true)}
      >
        Eliminar respuesta
      </button>
    );
  return (
    <div className="notice error-notice">
      <p>
        <strong>¿Eliminar la respuesta de {businessName}?</strong>
        <br />
        Esta acción también elimina sus datos de contacto y no se puede deshacer
        desde el dashboard.
      </p>
      <form action={deleteResponse}>
        <input type="hidden" name="id" value={id} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".7rem" }}>
          <button className="button button-danger" type="submit">
            Sí, eliminar
          </button>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
