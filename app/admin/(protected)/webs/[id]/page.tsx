import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostForm } from "@/components/admin/CostForm";
import { Flash } from "@/components/admin/Flash";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { SiteForm } from "@/components/admin/SiteForm";
import { conceptLabels, formatDate, formatEuros, kindLabels, nextChargeOn, periodLabels } from "@/lib/billing";
import { todayString } from "@/lib/dates";
import { getSite } from "@/lib/db";
import {
  archiveSiteAction, deleteCostAction, deleteDomainAction, deletePaymentAction, deleteSiteAction, saveDomainAction, updateSiteAction,
} from "../../actions";

export default async function SitePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const site = getSite(id);
  if (!site) notFound();
  const back = `/admin/webs/${site.id}`;

  return (
    <>
      <div className={styles.topline}>
        <div>
          <h1>{site.name}</h1>
          <p>
            {site.url ? <a href={site.url} target="_blank" rel="noreferrer">{site.domain || site.url}</a> : "Sin URL"} · {kindLabels[site.kind]}
            {site.archived && " · Archivada"}
          </p>
        </div>
        <Link className="button button-quiet" href="/admin/webs">Volver</Link>
      </div>
      <Flash error={error} ok={ok} />

      <section className={styles.stats} aria-label="Saldo">
        <div className={styles.stat}><strong>{formatEuros(site.accruedCents)}</strong><span>Devengado ({site.setupCents ? "desarrollo + " : ""}{site.months} {site.months === 1 ? "mes" : "meses"})</span></div>
        <div className={styles.stat}><strong>{formatEuros(site.paidCents)}</strong><span>Cobrado</span></div>
        <div className={`${styles.stat} ${site.pendingCents > 0 ? styles.statAlert : ""}`}><strong>{formatEuros(site.pendingCents)}</strong><span>{site.pendingCents >= 0 ? "Pendiente" : "Saldo a favor (negativo)"}</span></div>
        <div className={styles.stat}><strong>{formatEuros(site.monthlyCents - site.monthlyCostCents)}</strong><span>Margen al mes · próxima cuota {formatDate(nextChargeOn(site))}</span></div>
      </section>

      <section className={styles.panel}>
        <h2>Cobros</h2>
        <PaymentForm siteId={site.id} back={back} today={todayString()} />
        <div className={styles.table} role="table">
          {site.payments.map((payment) => (
            <form action={deletePaymentAction} className={styles.tableRow} role="row" key={payment.id}>
              <input type="hidden" name="id" value={payment.id} />
              <span role="cell">{formatDate(payment.paidOn)}</span>
              <strong role="cell">{formatEuros(payment.amountCents)}</strong>
              <span role="cell">{conceptLabels[payment.concept]}</span>
              <small role="cell">{payment.notes}</small>
              <span role="cell"><ConfirmButton /></span>
            </form>
          ))}
          {site.payments.length === 0 && <p className="muted">Sin cobros registrados.</p>}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Dominios</h2>
        <div className={styles.list}>
          {site.domains.map((domain) => (
            <details className={styles.item} key={domain.id}>
              <summary>
                <strong>{domain.name}</strong>
                <span>{domain.registrar || "Registrador sin indicar"} · renueva {formatDate(domain.renewsOn)} · {domain.yearlyCents ? `${formatEuros(domain.yearlyCents)}/año` : "coste sin indicar"}{domain.autoRenew ? " · auto" : ""}</span>
              </summary>
              <DomainForm siteId={site.id} domain={domain} />
              <form action={deleteDomainAction}>
                <input type="hidden" name="id" value={domain.id} />
                <input type="hidden" name="siteId" value={site.id} />
                <ConfirmButton label="Borrar dominio" />
              </form>
            </details>
          ))}
          <details className={styles.item}>
            <summary><strong>+ Añadir dominio</strong></summary>
            <DomainForm siteId={site.id} />
          </details>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Costes de esta web</h2>
        <div className={styles.table} role="table">
          {site.costs.map((cost) => (
            <form action={deleteCostAction} className={styles.tableRow} role="row" key={cost.id}>
              <input type="hidden" name="id" value={cost.id} />
              <strong role="cell">{cost.concept}</strong>
              <span role="cell">{cost.provider}</span>
              <span role="cell">{formatEuros(cost.amountCents)} · {periodLabels[cost.period]}</span>
              <small role="cell">{cost.notes}</small>
              <span role="cell"><ConfirmButton /></span>
            </form>
          ))}
          {site.costs.length === 0 && <p className="muted">Sin costes propios. Los costes compartidos (VPS…) van en Costes.</p>}
        </div>
        <details className={styles.item}>
          <summary><strong>+ Añadir coste</strong></summary>
          <CostForm siteId={site.id} back={back} />
        </details>
      </section>

      <section className={styles.panel}>
        <h2>Datos de la web</h2>
        <SiteForm site={site} action={updateSiteAction} submit="Guardar cambios" />
      </section>

      <section className={`${styles.panel} ${styles.dangerZone}`}>
        <h2>Archivar o borrar</h2>
        <p className="muted">Archivar la oculta del resumen sin perder su historial. Borrar elimina también sus dominios, costes y cobros.</p>
        <div className={styles.actions}>
          <form action={archiveSiteAction}>
            <input type="hidden" name="id" value={site.id} />
            <input type="hidden" name="archived" value={site.archived ? "0" : "1"} />
            <button className="button button-quiet" type="submit">{site.archived ? "Desarchivar" : "Archivar"}</button>
          </form>
          <form action={deleteSiteAction}>
            <input type="hidden" name="id" value={site.id} />
            <ConfirmButton label="Borrar web" confirm="Sí, borrar todo" />
          </form>
        </div>
      </section>
    </>
  );
}

function DomainForm({ siteId, domain }: { siteId: string; domain?: NonNullable<ReturnType<typeof getSite>>["domains"][number] }) {
  return (
    <form action={saveDomainAction} className={styles.form}>
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="id" value={domain?.id || ""} />
      <div className={styles.formGrid}>
        <label className={styles.field}><span>Dominio</span><input className={styles.input} name="name" required defaultValue={domain?.name} placeholder="ejemplo.es" /></label>
        <label className={styles.field}><span>Registrador</span><input className={styles.input} name="registrar" defaultValue={domain?.registrar} placeholder="DonDominio, IONOS…" /></label>
        <label className={styles.field}><span>Próxima renovación</span><input className={styles.input} name="renewsOn" type="date" defaultValue={domain?.renewsOn || ""} /></label>
        <label className={styles.field}><span>Coste anual (€)</span><input className={styles.input} name="yearly" inputMode="decimal" defaultValue={domain?.yearlyCents ? (domain.yearlyCents / 100).toFixed(2).replace(".", ",") : ""} /></label>
        <label className={styles.check}><input type="checkbox" name="autoRenew" defaultChecked={domain?.autoRenew} /> Renovación automática</label>
        <label className={`${styles.field} ${styles.wide}`}><span>Notas</span><input className={styles.input} name="notes" defaultValue={domain?.notes} /></label>
      </div>
      <button className="button button-secondary" type="submit">{domain ? "Guardar dominio" : "Añadir dominio"}</button>
    </form>
  );
}
