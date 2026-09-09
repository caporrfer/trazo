"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          Trazo
        </div>
        <h1>No hemos podido cargar esta página</h1>
        <p className="lead">
          Puede ser un fallo temporal. Tu borrador local no se ha eliminado.
        </p>
        <button className="button button-primary" type="button" onClick={reset}>
          Volver a intentarlo
        </button>
      </div>
    </main>
  );
}
