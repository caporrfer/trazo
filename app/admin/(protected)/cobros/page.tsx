import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Empty, PageHead, Panel, Stat } from "@/components/admin/ui";
import { conceptLabels, formatDate, formatEuros, formatMonth } from "@/lib/billing";
import { listPayments, listSites } from "@/lib/db";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ web?: string }> }) {
  const { web } = await searchParams;
  const sites = listSites({ includeArchived: true });
  const names = new Map(sites.map((site) => [site.id, site.name]));
  const selected = web && names.has(web) ? web : undefined;
  const payments = listPayments(selected);
  const total = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const byMonth = new Map<string, number>();
  for (const payment of payments) byMonth.set(payment.paidOn.slice(0, 7), (byMonth.get(payment.paidOn.slice(0, 7)) || 0) + payment.amountCents);
  const months = [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const max = Math.max(1, ...months.map(([, cents]) => cents));
  const pending = sites.filter((site) => !site.archived && (!selected || site.id === selected)).reduce((sum, site) => sum + Math.max(0, site.pendingCents), 0);

  return (
    <>
      <PageHead kicker="Lo recaudado" title="Cobros" />
      <nav className={styles.chips} aria-label="Filtrar por web">
        <Link href="/admin/cobros" className={!selected ? styles.chipActive : undefined}>Todas</Link>
        {sites.map((site) => (
          <Link key={site.id} href={`/admin/cobros?web=${site.id}`} className={selected === site.id ? styles.chipActive : undefined}>{site.name}</Link>
        ))}
      </nav>
      <section className={styles.stats} aria-label="Totales">
        <Stat label="Total cobrado" value={formatEuros(total)} hint={`${payments.length} ${payments.length === 1 ? "cobro" : "cobros"}`} tone="good" />
        <Stat label="Pendiente" value={formatEuros(pending)} tone={pending ? "alert" : undefined} />
      </section>

      <div className={styles.columnsWide}>
        <Panel title="Historial">
          {payments.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Fecha</th><th>Web</th><th>Concepto</th><th className={styles.num}>Importe</th></tr></thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.paidOn)}</td>
                      <td><Link href={`/admin/webs/${payment.siteId}`}>{names.get(payment.siteId)}</Link></td>
                      <td>{conceptLabels[payment.concept]}{payment.notes ? <small className={styles.cellNote}>{payment.notes}</small> : null}</td>
                      <td className={styles.num}>{formatEuros(payment.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty>Aún no hay cobros registrados.</Empty>}
        </Panel>

        <Panel title="Por mes">
          {months.length ? (
            <ul className={styles.bars}>
              {months.map(([month, cents]) => (
                <li key={month}>
                  <span className={styles.barLabel}>{formatMonth(month)}</span>
                  <span className={styles.barTrack}><span className={styles.barFill} style={{ width: `${Math.max(4, (cents / max) * 100)}%` }} /></span>
                  <strong>{formatEuros(cents)}</strong>
                </li>
              ))}
            </ul>
          ) : <Empty>Sin datos.</Empty>}
        </Panel>
      </div>
    </>
  );
}
