import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Empty, PageHead, Panel, Stat } from "@/components/admin/ui";
import { conceptLabels, formatDate, formatEuros, kindLabels, monthlyEquivalentCents, nextChargeOn, periodLabels } from "@/lib/billing";
import { daysToRenewal } from "@/lib/domains";
import { getSite } from "@/lib/db";

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = getSite(id);
  if (!site) notFound();

  return (
    <>
      <Link className={styles.backLink} href="/admin/webs">← Webs</Link>
      <PageHead kicker={`${kindLabels[site.kind]}${site.archived ? " · Archivada" : ""}`} title={site.name}>
        {site.url ? <a href={site.url} target="_blank" rel="noreferrer">{site.domain || site.url} ↗</a> : "Sin URL"}
      </PageHead>

      <section className={styles.stats} aria-label="Saldo">
        <Stat label="Pendiente" value={formatEuros(Math.max(0, site.pendingCents))} hint={site.pendingCents < 0 ? `${formatEuros(-site.pendingCents)} a favor` : `Próxima cuota ${formatDate(nextChargeOn(site))}`} tone={site.pendingCents > 0 ? "alert" : "good"} />
        <Stat label="Cobrado" value={formatEuros(site.paidCents)} hint={`${site.payments.length} ${site.payments.length === 1 ? "cobro" : "cobros"}`} />
        <Stat label="Devengado" value={formatEuros(site.accruedCents)} hint={`${site.setupCents ? "Desarrollo + " : ""}${site.months} ${site.months === 1 ? "mes" : "meses"}`} />
        <Stat label="Margen al mes" value={formatEuros(site.monthlyCents - site.monthlyCostCents)} hint={`Cuota ${formatEuros(site.monthlyCents)} · costes ${formatEuros(site.monthlyCostCents)}`} />
      </section>

      <div className={styles.columns}>
        <Panel title="Datos">
          <dl className={styles.facts}>
            <div><dt>Alta</dt><dd>{formatDate(site.startedOn)}</dd></div>
            {site.endedOn && <div><dt>Baja</dt><dd>{formatDate(site.endedOn)}</dd></div>}
            <div><dt>Cuota mensual</dt><dd>{formatEuros(site.monthlyCents)}</dd></div>
            <div><dt>Desarrollo</dt><dd>{site.setupCents ? formatEuros(site.setupCents) : "—"}</dd></div>
            <div><dt>Alojamiento</dt><dd>{site.hosting || "—"}</dd></div>
            {site.notes && <div><dt>Notas</dt><dd>{site.notes}</dd></div>}
          </dl>
        </Panel>

        <Panel title="Dominios">
          {site.domains.length ? (
            <ul className={styles.rows}>
              {site.domains.map((domain) => {
                const days = domain.renewsOn ? daysToRenewal(domain.renewsOn) : undefined;
                return (
                  <li key={domain.id} className={styles.rowStatic}>
                    <span><strong>{domain.name}</strong><small>{domain.registrar || "Registrador sin indicar"} · {domain.yearlyCents ? `${formatEuros(domain.yearlyCents)}/año` : "coste sin indicar"}{domain.autoRenew ? " · renovación automática" : ""}</small></span>
                    <span className={styles.right}>
                      {days !== undefined ? <Badge tone={days < 0 ? "danger" : days <= 30 ? "warn" : undefined}>{formatDate(domain.renewsOn)}</Badge> : <Badge tone="muted">Sin fecha</Badge>}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : <Empty>Sin dominios registrados.</Empty>}
        </Panel>
      </div>

      <Panel title="Cobros" aside={formatEuros(site.paidCents)}>
        {site.payments.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Fecha</th><th>Concepto</th><th>Notas</th><th className={styles.num}>Importe</th></tr></thead>
              <tbody>
                {site.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paidOn)}</td>
                    <td>{conceptLabels[payment.concept]}</td>
                    <td className={styles.mutedCell}>{payment.notes || "—"}</td>
                    <td className={styles.num}>{formatEuros(payment.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>Sin cobros registrados.</Empty>}
      </Panel>

      <Panel title="Costes de esta web" aside={`${formatEuros(site.monthlyCostCents)}/mes`}>
        {site.costs.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Concepto</th><th>Proveedor</th><th>Periodicidad</th><th className={styles.num}>Importe</th><th className={styles.num}>Al mes</th></tr></thead>
              <tbody>
                {site.costs.map((cost) => (
                  <tr key={cost.id}>
                    <td>{cost.concept}</td>
                    <td className={styles.mutedCell}>{cost.provider || "—"}</td>
                    <td>{periodLabels[cost.period]}</td>
                    <td className={styles.num}>{formatEuros(cost.amountCents)}</td>
                    <td className={styles.num}>{formatEuros(monthlyEquivalentCents(cost.amountCents, cost.period))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>Sin costes propios (los dominios se suman aparte; los costes compartidos están en Costes).</Empty>}
      </Panel>
    </>
  );
}
