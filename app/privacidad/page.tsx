import { Brand } from "@/components/Brand";

export const metadata = { title: "Privacidad" };
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  const legalName = process.env.TRAZO_LEGAL_NAME || "[Nombre legal pendiente]";
  const email =
    process.env.TRAZO_PRIVACY_EMAIL || "[Correo de privacidad pendiente]";
  return (
    <main id="contenido" className="prose-shell">
      <Brand href="/" />
      <h1>Información de privacidad</h1>
      {!process.env.TRAZO_LEGAL_NAME && (
        <p className="legal-placeholder">
          <strong>Pendiente antes de publicar:</strong> completa los datos del
          responsable en las variables de producción y solicita una revisión
          jurídica.
        </p>
      )}
      <h2>Responsable y finalidad</h2>
      <p>
        <strong>{legalName}</strong> es responsable de esta web. Si nos llamas
        o nos escribes, usaremos tus datos únicamente para responderte y, si
        lo pides, preparar un presupuesto o prestarte el servicio contratado.
      </p>
      <h2>Datos que tratamos</h2>
      <p>
        Esta web no tiene formularios, no usa cookies de seguimiento y no
        recoge datos personales. Solo tratamos los datos que nos facilitas al
        contactar por teléfono o WhatsApp.
      </p>
      <h2>Base jurídica y conservación</h2>
      <p>
        El tratamiento se basa en atender tu solicitud y, en su caso, en la
        relación contractual. Conservamos los datos mientras dure esa relación
        y durante los plazos que exija la ley. No los cedemos a terceros salvo
        obligación legal.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación o eliminación, así como ejercer
        los demás derechos previstos en la normativa, escribiendo a{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <p>
        Puedes consultar el texto oficial del Reglamento General de Protección
        de Datos en{" "}
        <a
          href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/spa"
          target="_blank"
          rel="noreferrer"
        >
          EUR-Lex
        </a>
        .
      </p>
    </main>
  );
}
