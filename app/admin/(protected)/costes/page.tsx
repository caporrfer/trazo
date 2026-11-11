import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Empty, PageHead, Panel, Stat } from "@/components/admin/ui";
import { formatDate, formatEuros, monthlyEquivalentCents, periodLabels } from "@/lib/billing";
import { listCosts, listSites } from "@/lib/db";

export default function CostsPage() {
  const sites = listSites();
  const names = new Map(sites.map((site) => [site.id, site.name]));
  const costs = listCosts().filter((cost) => !cost.siteId || names.has(cost.siteId));
  const domains = sites.flatMap((site) => site.domains.map((domain) => ({ ...domain, siteName: site.name })));
  const monthly = costs.reduce((sum, cost) => sum + monthlyEquivalentCents(cost.amountCents, cost.period), 0)
    + domains.reduce((sum, domain) => sum + monthlyEquivalentCents(domain.yearlyCents, "anual"), 0);
  const income = sites.filter((site) => !site.endedOn).reduce((sum, site) => sum + site.monthlyCents, 0);

  return (
    <>
      <PageHead kicker="Lo que nos cuesta" title="Costes" />
      <section className={styles.stats} aria-label="Costes">
        <Stat label="Costes al mes" value={formatEuros(monthly)} hint="Anuales prorrateados" />
        <Stat label="Ingresos al mes" value={formatEuros(income)} />
        <Stat label="Margen al mes" value={formatEuros(income - monthly)} tone={income - monthly >= 0 ? "good" : "alert"} />
      </section>

      <Panel title="Servicios">
        {costs.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Concepto</th><th>Web</th><th>Proveedor</th><th>Periodicidad</th><th className={styles.num}>Importe</th><th className={styles.num}>Al mes</th></tr></thead>
              <tbody>
                {costs.map((cost) => (
                  <tr key={cost.id}>
                    <td>{cost.concept}{cost.notes ? <small className={styles.cellNote}>{cost.notes}</small> : null}</td>
                    <td>{cost.siteId ? <Link href={`/admin/webs/${cost.siteId}`}>{names.get(cost.siteId)}</Link> : <span className={styles.mutedCell}>General</span>}</td>
                    <td className={styles.mutedCell}>{cost.provider || "—"}</td>
                    <td>{periodLabels[cost.period]}</td>
                    <td className={styles.num}>{formatEuros(cost.amountCents)}</td>
                    <td className={styles.num}>{formatEuros(monthlyEquivalentCents(cost.amountCents, cost.period))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>Todavía no hay costes registrados.</Empty>}
      </Panel>

      <Panel title="Dominios">
        {domains.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Dominio</th><th>Web</th><th>Registrador</th><th>Renovación</th><th className={styles.num}>Al año</th></tr></thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td>{domain.name}</td>
                    <td><Link href={`/admin/webs/${domain.siteId}`}>{domain.siteName}</Link></td>
                    <td className={styles.mutedCell}>{domain.registrar || "—"}</td>
                    <td>{formatDate(domain.renewsOn)}</td>
                    <td className={styles.num}>{domain.yearlyCents ? formatEuros(domain.yearlyCents) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>Ningún dominio registrado todavía.</Empty>}
      </Panel>
    </>
  );
}
