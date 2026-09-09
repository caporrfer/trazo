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
      <h2>Uso del servicio</h2>
      <p>
        Los enlaces de propuesta están destinados al negocio indicado y permiten
        enviar una valoración no contractual. Elegir una tarifa no supone una
        contratación ni genera un pago.
      </p>
      <h2>Condiciones informativas</h2>
      <p>
        La disponibilidad de dominios y el alcance final de cualquier desarrollo
        se confirman antes de formalizar un servicio. Las tarifas mostradas
        sirven para conocer la opción que interesa al negocio.
      </p>
    </main>
  );
}
