export default function Loading() {
  return (
    <main id="contenido" className="home-shell" aria-busy="true">
      <div className="home-card">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          Trazo
        </div>
        <p className="lead" role="status">
          Cargando la propuesta…
        </p>
      </div>
    </main>
  );
}
