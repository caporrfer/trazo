"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section>
      <h1>No hemos podido completar la operación</h1>
      <p className="notice" role="alert">
        Los cambios no se han confirmado. Revisa la conexión y vuelve a
        intentarlo.
      </p>
      <button className="button button-primary" type="button" onClick={reset}>
        Reintentar
      </button>
    </section>
  );
}
