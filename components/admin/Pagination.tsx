import Link from "next/link";
import styles from "./Admin.module.css";

export function Pagination({
  basePath,
  query,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const href = (target: number) => {
    const params = new URLSearchParams(
      Object.entries(query).filter(
        (entry): entry is [string, string] =>
          entry[0] !== "page" && Boolean(entry[1]),
      ),
    );
    params.set("page", String(target));
    return `${basePath}?${params}`;
  };
  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <span>
        Página {page} de {totalPages}
      </span>
      {page > 1 && (
        <Link className="button button-quiet" href={href(page - 1)}>
          Anterior
        </Link>
      )}
      {page < totalPages && (
        <Link className="button button-secondary" href={href(page + 1)}>
          Siguiente
        </Link>
      )}
    </nav>
  );
}
