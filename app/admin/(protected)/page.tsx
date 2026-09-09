import Link from "next/link";
import { listAdminProposals, listAdminResponses } from "@/lib/repository";
import {
  commercialLabels,
  formatDate,
  intentLabels,
  planLabels,
} from "@/lib/admin-content";
import styles from "@/components/admin/Admin.module.css";

export default async function DashboardPage() {
  const [proposals, responses] = await Promise.all([
    listAdminProposals(),
    listAdminResponses(),
  ]);
  const pending = responses.filter(
    (item) => item.followupStatus === "pending",
  ).length;
  const changes = responses.filter((item) => item.intent === "changes").length;
  return (
    <>
      <div className={styles.topline}>
        <div>
          <h1>Resumen</h1>
          <p>Lo que necesita tu atención hoy.</p>
        </div>
        <Link className="button button-primary" href="/admin/propuestas/nueva">
          Nueva propuesta
        </Link>
      </div>
      <section className={styles.stats} aria-label="Indicadores">
        <div className={styles.stat}>
          <strong>{proposals.length}</strong>
          <span>Propuestas creadas</span>
        </div>
        <div className={styles.stat}>
          <strong>
            {proposals.filter((item) => item.stage === "sent").length}
          </strong>
          <span>Enviadas</span>
        </div>
        <div className={styles.stat}>
          <strong>{responses.length}</strong>
          <span>Respuestas</span>
        </div>
        <div className={styles.stat}>
          <strong>{pending}</strong>
          <span>Pendientes de contacto</span>
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Respuestas recientes</h2>
        <div className={styles.list}>
          {responses.slice(0, 6).map((response) => (
            <Link
              className={styles.row}
              href={`/admin/respuestas/${response.id}`}
              key={response.id}
            >
              <span>
                <strong>{response.businessName}</strong>
                <small>
                  {response.respondentName || "Respuesta sin nombre"}
                </small>
              </span>
              <span>
                <strong>{intentLabels[response.intent]}</strong>
                <small>
                  {response.plan ? planLabels[response.plan] : "Sin tarifa"}
                </small>
              </span>
              <span>
                <small>{formatDate(response.createdAt)}</small>
              </span>
              <span
                className={`${styles.tag} ${response.unread ? styles.tagNew : ""}`}
              >
                {response.unread
                  ? "Nueva"
                  : response.followupStatus === "pending"
                    ? "Pendiente"
                    : "Leída"}
              </span>
            </Link>
          ))}
          {responses.length === 0 && (
            <div className={styles.empty}>
              Las respuestas aparecerán aquí cuando lleguen.
            </div>
          )}
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Seguimiento</h2>
        <p className="muted">
          {changes} negocios han solicitado cambios.{" "}
          {
            proposals.filter(
              (item) => item.commercialStatus === "not_interested",
            ).length
          }{" "}
          figuran como no interesados.
        </p>
        <div className={styles.list}>
          {proposals
            .filter((item) => item.nextContactAt)
            .slice(0, 5)
            .map((proposal) => (
              <Link
                className={styles.row}
                href={`/admin/propuestas/${proposal.id}`}
                key={proposal.id}
              >
                <span>
                  <strong>{proposal.businessName}</strong>
                  <small>{commercialLabels[proposal.commercialStatus]}</small>
                </span>
                <span>
                  <small>Próximo contacto</small>
                  <strong>{formatDate(proposal.nextContactAt!)}</strong>
                </span>
                <span />
                <span>Ver</span>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
