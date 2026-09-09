import Link from "next/link";

export default function ProposalNotFound() {
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          Trazo
        </Link>
        <p className="eyebrow">Propuesta no disponible</p>
        <h1>No podemos abrir este enlace.</h1>
        <p className="lead">
          Puede que la propuesta esté desactivada o que el enlace no esté
          completo. Escríbenos usando el mismo canal por el que lo recibiste y
          te ayudaremos.
        </p>
      </div>
    </main>
  );
}
