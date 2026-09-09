import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  commercialLabels,
  formatDate,
  intentLabels,
  stageLabels,
} from "@/lib/admin-content";
import {
  getAdminProposal,
  listAdminFollowups,
  listAdminNotes,
  listAdminResponses,
} from "@/lib/repository";
import styles from "@/components/admin/Admin.module.css";
import { CopyButton } from "@/components/admin/CopyButton";
import {
  addFollowup,
  addNote,
  markProposalSent,
  updateProposal,
  updateProposalDetails,
} from "../../actions";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, allResponses, notes, followups] = await Promise.all([
    getAdminProposal(id),
    listAdminResponses(),
    listAdminNotes(id),
    listAdminFollowups(id),
  ]);
  if (!proposal) notFound();
  const responses = allResponses.filter(
    (item) => item.proposalId === proposal.id,
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = proposal.slug
    ? `${appUrl}/propuesta/${proposal.slug}/${proposal.token}`
    : "";
  const proposalComplete = Boolean(
    proposal.slug &&
      proposal.demoUrl &&
      proposal.businessName !== "Borrador sin nombre" &&
      proposal.businessType !== "Tipo pendiente",
  );
  const message = `Hola, hemos preparado una propuesta web para ${proposal.businessName}.\n\nDemo: ${proposal.demoUrl}\nFormulario: ${publicUrl}`;
  return (
    <>
      <Link className={styles.back} href="/admin/propuestas">
        <ArrowLeft size={18} />
        Volver a propuestas
      </Link>
      <div className={styles.topline}>
        <div>
          <h1>{proposal.businessName}</h1>
          <p>
            {proposal.businessType} · Creada {formatDate(proposal.createdAt)}
          </p>
        </div>
        <span className={styles.tag}>{stageLabels[proposal.stage]}</span>
      </div>
      <div className={styles.detailGrid}>
        <div>
          <section className={styles.panel}>
            <h2>Datos de la propuesta</h2>
            <form action={updateProposalDetails}>
              <input type="hidden" name="id" value={proposal.id} />
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="businessName">Nombre del negocio</label>
                  <input
                    className={styles.input}
                    id="businessName"
                    name="businessName"
                    defaultValue={
                      proposal.businessName === "Borrador sin nombre"
                        ? ""
                        : proposal.businessName
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="businessType">Tipo de negocio</label>
                  <input
                    className={styles.input}
                    id="businessType"
                    name="businessType"
                    defaultValue={
                      proposal.businessType === "Tipo pendiente"
                        ? ""
                        : proposal.businessType
                    }
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="slug">Slug público</label>
                <input
                  className={styles.input}
                  id="slug"
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  defaultValue={proposal.slug}
                />
                <span className="muted">
                  Queda bloqueado después de la primera activación.
                </span>
              </div>
              <div className={styles.field}>
                <label htmlFor="demoUrl">URL HTTPS de la demo</label>
                <input
                  className={styles.input}
                  id="demoUrl"
                  name="demoUrl"
                  type="url"
                  defaultValue={proposal.demoUrl}
                />
              </div>
              <h3>Contacto interno conocido</h3>
              <p className="muted">No se mostrará en el formulario público.</p>
              <div className={styles.field}>
                <label htmlFor="knownContactName">
                  Nombre <span className="muted">(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  id="knownContactName"
                  name="knownContactName"
                  maxLength={100}
                  defaultValue={proposal.knownContactName}
                />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="knownContactEmail">
                    Correo <span className="muted">(opcional)</span>
                  </label>
                  <input
                    className={styles.input}
                    id="knownContactEmail"
                    name="knownContactEmail"
                    type="email"
                    maxLength={180}
                    defaultValue={proposal.knownContactEmail}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="knownContactPhone">
                    Teléfono <span className="muted">(opcional)</span>
                  </label>
                  <input
                    className={styles.input}
                    id="knownContactPhone"
                    name="knownContactPhone"
                    type="tel"
                    maxLength={30}
                    defaultValue={proposal.knownContactPhone}
                  />
                </div>
              </div>
              <button className="button button-secondary" type="submit">
                Actualizar datos
              </button>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Publicación y seguimiento</h2>
            <form action={updateProposal}>
              <input type="hidden" name="id" value={proposal.id} />
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="stage">Preparación</label>
                  <select
                    className={styles.select}
                    id="stage"
                    name="stage"
                    defaultValue={proposal.stage}
                  >
                    {Object.entries(stageLabels).map(([key, text]) => (
                      <option
                        value={key}
                        key={key}
                        disabled={
                          !proposalComplete &&
                          ["prepared", "sent"].includes(key)
                        }
                      >
                        {text}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="commercialStatus">Situación comercial</label>
                  <select
                    className={styles.select}
                    id="commercialStatus"
                    name="commercialStatus"
                    defaultValue={proposal.commercialStatus}
                  >
                    {Object.entries(commercialLabels).map(([key, text]) => (
                      <option value={key} key={key}>
                        {text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="nextContactAt">Próximo contacto</label>
                <input
                  className={styles.input}
                  id="nextContactAt"
                  name="nextContactAt"
                  type="datetime-local"
                  defaultValue={proposal.nextContactAt?.slice(0, 16)}
                />
              </div>
              <label className={styles.field}>
                <span>
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={proposal.active}
                    disabled={!proposalComplete}
                  />{" "}
                  Formulario público activo
                </span>
              </label>
              <div className={styles.actions}>
                <button className="button button-primary" type="submit">
                  Guardar cambios
                </button>
              </div>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Respuestas</h2>
            <div className={styles.list}>
              {responses.map((response) => (
                <Link
                  className={styles.row}
                  href={`/admin/respuestas/${response.id}`}
                  key={response.id}
                >
                  <span>
                    <strong>{response.respondentName || "Sin nombre"}</strong>
                    <small>{intentLabels[response.intent]}</small>
                  </span>
                  <span>
                    <small>{formatDate(response.createdAt)}</small>
                  </span>
                  <span />
                  <span
                    className={`${styles.tag} ${response.unread ? styles.tagNew : ""}`}
                  >
                    {response.unread ? "Nueva" : "Ver"}
                  </span>
                </Link>
              ))}
              {responses.length === 0 && (
                <div className={styles.empty}>
                  Esta propuesta todavía no tiene respuestas.
                </div>
              )}
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Nota interna</h2>
            <form action={addNote}>
              <input type="hidden" name="proposalId" value={proposal.id} />
              <div className={styles.field}>
                <label htmlFor="text">Añadir una nota</label>
                <textarea
                  className={styles.textarea}
                  id="text"
                  name="text"
                  required
                  maxLength={3000}
                />
              </div>
              <button className="button button-secondary" type="submit">
                Guardar nota
              </button>
            </form>
            <div className={styles.list}>
              {notes.map((note) => (
                <article className={styles.row} key={note.id}>
                  <span>
                    <strong>Nota</strong>
                    <small>{formatDate(note.createdAt)}</small>
                  </span>
                  <span>{note.body}</span>
                </article>
              ))}
              {notes.length === 0 && (
                <p className="muted">Todavía no hay notas.</p>
              )}
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Historial de seguimiento</h2>
            <div className={styles.list}>
              {followups.map((followup) => (
                <article className={styles.row} key={followup.id}>
                  <span>
                    <strong>{followup.channel}</strong>
                    <small>{formatDate(followup.contactedAt)}</small>
                  </span>
                  <span>{followup.result}</span>
                  <span>
                    {followup.nextContactAt
                      ? `Siguiente: ${formatDate(followup.nextContactAt)}`
                      : "Sin próxima fecha"}
                  </span>
                </article>
              ))}
              {followups.length === 0 && (
                <p className="muted">Todavía no hay contactos registrados.</p>
              )}
            </div>
          </section>
        </div>
        <aside>
          <section className={styles.panel}>
            <h2>Enlaces</h2>
            {!proposalComplete && (
              <p className="notice">
                Completa nombre, tipo, slug y demo para activar, preparar o
                enviar esta propuesta.
              </p>
            )}
            {proposalComplete && (
              <>
                <div className={styles.field}>
                  <label>Formulario personalizado</label>
                  <small className="muted">{publicUrl}</small>
                </div>
                <div className={styles.actions}>
                  <CopyButton
                    text={publicUrl}
                    label="Copiar formulario"
                    icon={<Copy size={18} />}
                  />
                  <a
                    className="button button-quiet"
                    href={`/admin/vista-previa/${proposal.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Vista previa <ExternalLink size={18} />
                  </a>
                </div>
                <div className={styles.field}>
                  <label>Demo externa</label>
                  <small className="muted">{proposal.demoUrl}</small>
                </div>
                <div className={styles.actions}>
                  <CopyButton
                    text={proposal.demoUrl}
                    label="Copiar demo"
                    icon={<Copy size={18} />}
                  />
                  <CopyButton
                    text={message}
                    label="Copiar ambos y mensaje"
                    icon={<Copy size={18} />}
                  />
                </div>
              </>
            )}
            <form action={markProposalSent}>
              <input type="hidden" name="id" value={proposal.id} />
              <button
                className="button button-primary"
                type="submit"
                disabled={!proposalComplete}
              >
                Marcar como enviada
              </button>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Registrar contacto</h2>
            <form action={addFollowup}>
              <input type="hidden" name="proposalId" value={proposal.id} />
              <div className={styles.field}>
                <label htmlFor="channel">Canal</label>
                <select className={styles.select} id="channel" name="channel">
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
                  maxLength={1000}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="followupDate">
                  Siguiente contacto <span className="muted">(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  id="followupDate"
                  name="nextContactAt"
                  type="datetime-local"
                />
              </div>
              <button className="button button-secondary" type="submit">
                Registrar seguimiento
              </button>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}
