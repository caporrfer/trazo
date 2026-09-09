import Link from "next/link";

export default function HomePage() {
  return (
    <main id="contenido" className="home-shell">
      <div className="home-card">
        <Link className="brand" href="/" aria-label="Trazo, inicio">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          Trazo
        </Link>
        <p className="eyebrow">Propuestas web personalizadas</p>
        <h1>Tu propuesta empieza en el enlace que has recibido.</h1>
        <p className="lead">
          Cada negocio recibe un acceso privado para revisar su borrador,
          contarnos qué le parece y decidir con calma cómo continuar.
        </p>
        <div className="home-note">
          <strong>¿Tienes un enlace de Trazo?</strong>
          <span>
            Ábrelo desde el mensaje de WhatsApp o correo que te hemos enviado.
          </span>
        </div>
        {process.env.TRAZO_DEMO_MODE === "true" && (
          <Link
            className="button button-primary"
            href="/propuesta/restaurante-paco/demo-seguro-trazo-2026"
          >
            Abrir propuesta de ejemplo
          </Link>
        )}
      </div>
    </main>
  );
}
