import { Brand } from "@/components/Brand";

export const metadata = { title: "Aviso legal" };
export const dynamic = "force-dynamic";

export default function LegalPage() {
  return (
    <main id="contenido" className="prose-shell">
      <Brand href="/" />
      <h1>Aviso legal</h1>
      {!process.env.TRAZO_LEGAL_NAME && (
        <p className="legal-placeholder">
          <strong>Pendiente antes de publicar:</strong> completa la identidad,
          NIF y domicilio del responsable.
        </p>
      )}
      <h2>Titular</h2>
      <p>
        {process.env.TRAZO_LEGAL_NAME || "[Nombre legal pendiente]"}
        <br />
        {process.env.TRAZO_TAX_ID || "[NIF pendiente]"}
        <br />
        {process.env.TRAZO_ADDRESS || "[Domicilio pendiente]"}
      </p>
      <h2>Objeto</h2>
      <p>
        Esta web informa sobre nuestros servicios de diseño y desarrollo de
        páginas web, tiendas online, posicionamiento y mantenimiento.
      </p>
      <h2>Precios</h2>
      <p>
        Los precios publicados son orientativos. El alcance y el precio final
        de cada proyecto se confirman antes de empezar.
      </p>
    </main>
  );
}
