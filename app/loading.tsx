import { Brand } from "@/components/Brand";

export default function Loading() {
  return (
    <main id="contenido" className="home-shell" aria-busy="true">
      <div className="home-card">
        <Brand />
        <p className="lead" role="status">
          Cargando…
        </p>
      </div>
    </main>
  );
}
