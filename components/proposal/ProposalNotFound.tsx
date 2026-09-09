import { Brand } from "@/components/Brand";

export function ProposalNotFound() {
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Brand href="/" />
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
