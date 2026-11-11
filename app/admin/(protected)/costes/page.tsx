import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostForm } from "@/components/admin/CostForm";
import { Flash } from "@/components/admin/Flash";
import { formatDate, formatEuros, monthlyEquivalentCents, periodLabels } from "@/lib/billing";
import { listCosts, listSites } from "@/lib/db";
import { deleteCostAction } from "../actions";

export default async function CostsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sites = listSites();
  const names = new Map(sites.map((site) => [site.id, site.name]));
  const costs = listCosts().filter((cost) => !cost.siteId || names.has(cost.siteId));
  const domains = sites.flatMap((site) => site.domains.map((domain) => ({ ...domain, siteName: site.name })));
  const monthly = costs.reduce((sum, cost) => sum + monthlyEquivalentCents(cost.amountCents, cost.period), 0)
    + domains.reduce((sum, domain) => sum + monthlyEquivalentCents(domain.yearlyCents, "anual"), 0);
  const income = sites.filter((site) => !site.endedOn).reduce((sum, site) => sum + site.monthlyCents, 0);

  return (
    <>
      <div className={styles.topline}><div><h1>Costes</h1><p>Lo que nos cuesta mantener las webs: servidores, dominios y otros servicios.</p></div></div>
      <Flash error={error} />
      <section className={styles.stats} aria-label="Costes">
        <div className={styles.stat}><strong>{formatEuros(monthly)}</strong><span>Coste mensual (anuales prorrateados)</span></div>
        <div className={styles.stat}><strong>{formatEuros(income)}</strong><span>Ingresos mensuales</span></div>
        <div className={styles.stat}><strong>{formatEuros(income - monthly)}</strong><span>Margen mensual</span></div>
      </section>

      <section className={styles.panel}>
        <h2>Servicios</h2>
        <div className={styles.table} role="table">
          {costs.map((cost) => (
            <form action={deleteCostAction} className={styles.tableRow} role="row" key={cost.id}>
              <input type="hidden" name="id" value={cost.id} />
              <strong role="cell">{cost.concept}</strong>
              <span role="cell">{cost.siteId ? <Link href={`/admin/webs/${cost.siteId}`}>{names.get(cost.siteId)}</Link> : "General"}</span>
              <span role="cell">{formatEuros(cost.amountCents)} · {periodLabels[cost.period]}</span>
              <small role="cell">{[cost.provider, cost.notes].filter(Boolean).join(" · ")}</small>
              <span role="cell"><ConfirmButton /></span>
            </form>
          ))}
          {costs.length === 0 && <p className="muted">Todavía no hay costes. Añade aquí el VPS y cualquier otro servicio.</p>}
        </div>
        <details className={styles.item}>
          <summary><strong>+ Añadir coste</strong></summary>
          <CostForm sites={sites} back="/admin/costes" />
        </details>
      </section>

      <section className={styles.panel}>
        <h2>Dominios</h2>
        <div className={styles.table} role="table">
          {domains.map((domain) => (
            <div className={styles.tableRow} role="row" key={domain.id}>
              <strong role="cell">{domain.name}</strong>
              <Link role="cell" href={`/admin/webs/${domain.siteId}`}>{domain.siteName}</Link>
              <span role="cell">{domain.yearlyCents ? `${formatEuros(domain.yearlyCents)}/año` : "Coste sin indicar"}</span>
              <small role="cell">{domain.registrar || "Registrador sin indicar"} · renueva {formatDate(domain.renewsOn)}</small>
              <span role="cell" />
            </div>
          ))}
          {domains.length === 0 && <p className="muted">Ningún dominio registrado. Se añaden desde la ficha de cada web.</p>}
        </div>
      </section>
    </>
  );
}
