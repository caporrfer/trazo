import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  contactLabels,
  formatDate,
  impressionLabels,
  intentLabels,
  planLabels,
} from "@/lib/admin-content";
import { optionLabels, changeOptions } from "@/lib/content";
import { getAdminResponse } from "@/lib/repository";
import styles from "@/components/admin/Admin.module.css";
import { DeleteResponseButton } from "@/components/admin/DeleteResponseButton";
import { addFollowup, addNote, markResponseRead } from "../../actions";

function answer(group: keyof typeof optionLabels, value?: string) {
  return value
    ? (optionLabels[group] as Record<string, string>)[value] || value
    : "Sin indicar";
}

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getAdminResponse(id);
  if (!response) notFound();
  const a = response.answers;
  const changes =
    a.changes
      .map((id) => changeOptions.find(([value]) => value === id)?.[1])
      .filter(Boolean)
      .join(", ") || "Ninguno indicado";
  return (
    <>
      <Link className={styles.back} href="/admin/respuestas">
        <ArrowLeft size={18} />
        Volver a respuestas
      </Link>
      <div className={styles.topline}>
        <div>
          <h1>{response.businessName}</h1>
          <p>Recibida {formatDate(response.createdAt)}</p>
        </div>
        <span
          className={`${styles.tag} ${response.unread ? styles.tagNew : ""}`}
        >
          {response.unread ? "Nueva" : "Leída"}
        </span>
      </div>
      <div className={styles.detailGrid}>
        <div>
          <section className={styles.panel}>
            <h2>Respuesta completa</h2>
            <dl className={styles.definition}>
              <dt>Ha visto el borrador</dt>
              <dd>{answer("viewed", a.viewed)}</dd>
              <dt>Valoración</dt>
              <dd>
                {a.impression ? impressionLabels[a.impression] : "Sin indicar"}
              </dd>
              <dt>Cómo quiere continuar</dt>
              <dd>{intentLabels[response.intent]}</dd>
              <dt>Cambios</dt>
              <dd>
                {changes}
                {a.changesNote && (
                  <>
                    <br />
                    {a.changesNote}
                  </>
                )}
              </dd>
              <dt>Objetivo</dt>
              <dd>{answer("goal", a.goal)}</dd>
              <dt>Tarifa</dt>
              <dd>{a.plan ? planLabels[a.plan] : "Sin indicar"}</dd>
              <dt>Dominio</dt>
              <dd>
                {a.currentDomain ||
                  a.desiredDomains.filter(Boolean).join(", ") ||
                  answer("domainStatus", a.domainStatus)}
              </dd>
              <dt>Nombre</dt>
              <dd>{a.respondentName || "No facilitado"}</dd>
              <dt>Relación</dt>
              <dd>{answer("relationship", a.relationship)}</dd>
              <dt>Participación</dt>
              <dd>{answer("decisionRole", a.decisionRole)}</dd>
              <dt>Contacto</dt>
              <dd>
                {a.contactMethod
                  ? contactLabels[a.contactMethod]
                  : "No solicitado"}
                {a.contactValue && ` · ${a.contactValue}`}
              </dd>
              <dt>Correo para trasladar</dt>
              <dd>{a.relayEmail || "No facilitado"}</dd>
              <dt>Horario</dt>
              <dd>
                {answer("contactTime", a.contactTime)}
                {a.preferredDateTime && ` · ${a.preferredDateTime}`}
              </dd>
              <dt>Motivo de desinterés</dt>
              <dd>
                {answer("declineReason", a.declineReason)}
                {a.declineNote && ` · ${a.declineNote}`}
              </dd>
            </dl>
            {response.unread && (
              <form className={styles.actions} action={markResponseRead}>
                <input type="hidden" name="id" value={response.id} />
                <button className="button button-secondary" type="submit">
                  Marcar como leída
                </button>
              </form>
            )}
          </section>
          <section className={styles.panel}>
            <h2>Nota interna</h2>
            <form action={addNote}>
              <input
                type="hidden"
                name="proposalId"
                value={response.proposalId}
              />
              <input type="hidden" name="responseId" value={response.id} />
              <div className={styles.field}>
                <label htmlFor="note">Añadir nota</label>
                <textarea
                  className={styles.textarea}
                  id="note"
                  name="text"
                  required
                  maxLength={3000}
                />
              </div>
              <button className="button button-secondary" type="submit">
                Guardar nota
              </button>
            </form>
          </section>
        </div>
        <aside>
          <section className={styles.panel}>
            <h2>Seguimiento</h2>
            <p className="muted">
              Estado:{" "}
              {response.followupStatus === "pending"
                ? "Pendiente"
                : response.followupStatus === "attended"
                  ? "Atendido"
                  : "No solicitado"}
            </p>
            <form action={addFollowup}>
              <input
                type="hidden"
                name="proposalId"
                value={response.proposalId}
              />
              <input type="hidden" name="responseId" value={response.id} />
              <div className={styles.field}>
                <label htmlFor="channel">Canal</label>
                <select
                  className={styles.select}
                  id="channel"
                  name="channel"
                  defaultValue={a.contactMethod || "other"}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Llamada</option>
                  <option value="email">Correo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="result">Resultado</label>
                <textarea
                  className={styles.textarea}
                  id="result"
                  name="result"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="nextContactAt">
                  Siguiente contacto <span className="muted">(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  id="nextContactAt"
                  name="nextContactAt"
                  type="datetime-local"
                />
              </div>
              <button className="button button-primary" type="submit">
                Registrar contacto
              </button>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Eliminar</h2>
            <p className="muted">
              Se eliminarán esta respuesta y sus datos asociados. Las demás
              respuestas del negocio se conservarán.
            </p>
            <DeleteResponseButton
              id={response.id}
              businessName={response.businessName}
            />
          </section>
        </aside>
      </div>
    </>
  );
}
