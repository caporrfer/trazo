import Link from "next/link";
import {
  contactLabels,
  formatDate,
  intentLabels,
  planLabels,
} from "@/lib/admin-content";
import { searchAdminResponses } from "@/lib/repository";
import styles from "@/components/admin/Admin.module.css";
import { Pagination } from "@/components/admin/Pagination";

export default async function ResponsesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const result = await searchAdminResponses({
    ...query,
    page: Number(query.page || 1),
  });
  const responses = result.items;
  const exportQuery = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  ).toString();
  return (
    <>
      <div className={styles.topline}>
        <div>
          <h1>Respuestas</h1>
          <p>{result.total} resultados.</p>
        </div>
        <a
          className="button button-secondary"
          href={`/api/admin/respuestas.csv?${exportQuery}`}
        >
          Exportar CSV
        </a>
      </div>
      {query.deleted && (
        <p className="notice" role="status">
          La respuesta se ha eliminado.
        </p>
      )}
      <form className={styles.filters}>
        <label className={styles.field}>
          <span className="sr-only">Buscar negocio</span>
          <input
            className={styles.input}
            name="q"
            defaultValue={query.q}
            placeholder="Buscar negocio"
          />
        </label>
        <label className={styles.field}>
          <span>Desde</span>
          <input
            className={styles.input}
            type="date"
            name="from"
            defaultValue={query.from}
          />
        </label>
        <label className={styles.field}>
          <span>Hasta</span>
          <input
            className={styles.input}
            type="date"
            name="to"
            defaultValue={query.to}
          />
        </label>
        <label className={styles.field}>
          <span className="sr-only">Intención</span>
          <select
            className={styles.select}
            name="intent"
            defaultValue={query.intent}
          >
            <option value="">Todas las intenciones</option>
            {Object.entries(intentLabels).map(([id, text]) => (
              <option value={id} key={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className="sr-only">Tarifa</span>
          <select
            className={styles.select}
            name="plan"
            defaultValue={query.plan}
          >
            <option value="">Todas las tarifas</option>
            {Object.entries(planLabels).map(([id, text]) => (
              <option value={id} key={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className="sr-only">Estado de respuesta</span>
          <select
            className={styles.select}
            name="read"
            defaultValue={query.read}
          >
            <option value="">Todas</option>
            <option value="new">Nuevas</option>
            <option value="pending">Pendientes</option>
          </select>
        </label>
        <button className="button button-secondary" type="submit">
          Filtrar
        </button>
      </form>
      <section className={styles.panel}>
        <div className={styles.list}>
          {responses.map((response) => (
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
                  {response.contactMethod
                    ? contactLabels[response.contactMethod]
                    : "Sin contacto"}
                </small>
              </span>
              <span>
                <strong>
                  {response.plan ? planLabels[response.plan] : "Sin tarifa"}
                </strong>
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
              No hay respuestas que coincidan con los filtros.
            </div>
          )}
        </div>
      </section>
      <Pagination
        basePath="/admin/respuestas"
        query={query}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </>
  );
}
