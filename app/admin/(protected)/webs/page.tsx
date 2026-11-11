import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Empty, PageHead } from "@/components/admin/ui";
import { formatDate, formatEuros, kindLabels } from "@/lib/billing";
import { listSites } from "@/lib/db";

export default function SitesPage() {
  const sites = listSites({ includeArchived: true });
  return (
    <>
      <PageHead kicker={`${sites.filter((site) => !site.archived).length} en activo`} title="Webs" />
      {sites.length === 0 && <Empty>Todavía no hay webs.</Empty>}
      <div className={styles.cards}>
        {sites.map((site) => (
          <Link className={`${styles.card} ${site.archived ? styles.cardMuted : ""}`} href={`/admin/webs/${site.id}`} key={site.id}>
            <div className={styles.cardTop}>
              <Badge tone={site.archived ? "muted" : undefined}>{site.archived ? "Archivada" : kindLabels[site.kind]}</Badge>
              <span className={styles.cardDate}>Desde {formatDate(site.startedOn)}</span>
            </div>
            <h2>{site.name}</h2>
            <p className={styles.cardDomain}>{site.domain || "Sin dominio"}</p>
            <dl className={styles.cardFacts}>
              <div><dt>Cuota</dt><dd>{formatEuros(site.monthlyCents)}/mes</dd></div>
              <div><dt>Desarrollo</dt><dd>{site.setupCents ? formatEuros(site.setupCents) : "—"}</dd></div>
              <div>
                <dt>Saldo</dt>
                <dd className={site.pendingCents > 0 ? styles.amountDanger : styles.amountGood}>
                  {site.pendingCents > 0 ? `Debe ${formatEuros(site.pendingCents)}` : site.pendingCents < 0 ? `+${formatEuros(-site.pendingCents)} a favor` : "Al día"}
                </dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </>
  );
}
