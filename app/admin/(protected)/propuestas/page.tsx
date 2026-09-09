import Link from "next/link";
import { searchAdminProposals } from "@/lib/repository";
import { commercialLabels, formatDate, stageLabels } from "@/lib/admin-content";
import styles from "@/components/admin/Admin.module.css";
import { Pagination } from "@/components/admin/Pagination";

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const result = await searchAdminProposals({
    ...query,
    page: Number(query.page || 1),
  });
  const proposals = result.items;
  return (
    <>
      <div className={styles.topline}>
        <div>
          <h1>Propuestas</h1>
          <p>{result.total} resultados.</p>
        </div>
        <Link className="button button-primary" href="/admin/propuestas/nueva">
          Nueva propuesta
        </Link>
      </div>
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
          <span className="sr-only">Preparación</span>
          <select
            className={styles.select}
            name="stage"
            defaultValue={query.stage}
          >
            <option value="">Todas las etapas</option>
            {Object.entries(stageLabels).map(([id, text]) => (
              <option value={id} key={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className="sr-only">Situación comercial</span>
          <select
            className={styles.select}
            name="status"
            defaultValue={query.status}
          >
            <option value="">Todas las situaciones</option>
            {Object.entries(commercialLabels).map(([id, text]) => (
              <option value={id} key={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-secondary" type="submit">
          Filtrar
        </button>
      </form>
      <section className={styles.panel}>
        <div className={styles.list}>
          {proposals.map((proposal) => (
            <Link
              className={styles.row}
              href={`/admin/propuestas/${proposal.id}`}
              key={proposal.id}
            >
              <span>
                <strong>{proposal.businessName}</strong>
                <small>{proposal.businessType}</small>
              </span>
              <span>
                <strong>{stageLabels[proposal.stage]}</strong>
                <small>
                  {proposal.active
                    ? "Formulario activo"
                    : "Formulario desactivado"}
                </small>
              </span>
              <span>
                <strong>{commercialLabels[proposal.commercialStatus]}</strong>
                <small>
                  {proposal.responseCount} respuestas · {proposal.unreadCount}{" "}
                  nuevas
                </small>
              </span>
              <span>
                <small>{formatDate(proposal.createdAt)}</small>
              </span>
            </Link>
          ))}
          {proposals.length === 0 && (
            <div className={styles.empty}>
              No hay propuestas que coincidan con los filtros.
            </div>
          )}
        </div>
      </section>
      <Pagination
        basePath="/admin/propuestas"
        query={query}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </>
  );
}
