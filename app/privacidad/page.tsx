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
        <strong>{legalName}</strong> utiliza los datos que facilitas para
        recoger tu valoración sobre la propuesta web y, únicamente si lo
        solicitas, ponerse en contacto contigo por el medio elegido.
      </p>
      <h2>Datos que tratamos</h2>
      <p>
        Guardamos las respuestas que envías y los datos de contacto que decides
        facilitar. El borrador previo se conserva solo en tu navegador hasta que
        lo envías o lo borras.
      </p>
      <h2>Base jurídica</h2>
      <p>
        Cuando solicitas información, cambios o contacto, el tratamiento se basa
        en atender las medidas que pides antes de decidir si formalizas un
        servicio. Si envías únicamente una opinión, la base prevista es el
        interés legítimo de Trazo en evaluar y mejorar la propuesta, sin usar
        esa respuesta para publicidad distinta. Puedes oponerte escribiendo al
        correo indicado más abajo. Estas bases deberán confirmarse en la
        revisión jurídica previa al lanzamiento.
      </p>
      <h2>Conservación y destinatarios</h2>
      <p>
        Las respuestas se conservan mientras la propuesta siga abierta y sean
        necesarias para gestionarla. Al cerrarla se revisan y se eliminan
        manualmente cuando dejan de ser necesarias, salvo el bloqueo exigido
        para atender posibles obligaciones o reclamaciones. Los proveedores
        técnicos de alojamiento y base de datos tratan información
        exclusivamente para prestar el servicio.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación o eliminación, así como ejercer
        los demás derechos previstos en la normativa, escribiendo a{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <p>
        Esta aplicación no utiliza tus respuestas para enviarte publicidad
        diferente de la conversación que hayas solicitado.
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
