import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import styles from "@/components/admin/Admin.module.css";
import { formatDate, formatEuros, kindLabels, monthlyEquivalentCents, nextChargeOn } from "@/lib/billing";
import { listCosts, listPayments, listSites, upcomingRenewals } from "@/lib/db";

export default function DashboardPage() {
  const sites = listSites();
  const active = sites.filter((site) => !site.endedOn);
  const mrr = active.reduce((sum, site) => sum + site.monthlyCents, 0);
  const collected = listPayments().reduce((sum, payment) => sum + payment.amountCents, 0);
  const pending = sites.reduce((sum, site) => sum + Math.max(0, site.pendingCents), 0);
  const generalCosts = listCosts().filter((cost) => !cost.siteId).reduce((sum, cost) => sum + monthlyEquivalentCents(cost.amountCents, cost.period), 0);
  const monthlyCosts = generalCosts + sites.reduce((sum, site) => sum + site.monthlyCostCents, 0);
  const debtors = sites.filter((site) => site.pendingCents > 0).sort((a, b) => b.pendingCents - a.pendingCents);
  const renewals = upcomingRenewals(60);

  return (
    <>
      <div className={styles.topline}>
        <div><h1>Resumen</h1><p>Webs en activo, cobros y renovaciones.</p></div>
        <Link className="button button-primary" href="/admin/cobros">Registrar cobro</Link>
      </div>
      <section className={styles.stats} aria-label="Indicadores">
        <div className={styles.stat}><strong>{active.length}</strong><span>Webs activas</span></div>
        <div className={styles.stat}><strong>{formatEuros(mrr)}</strong><span>Ingresos al mes</span></div>
        <div className={styles.stat}><strong>{formatEuros(collected)}</strong><span>Total cobrado</span></div>
        <div className={`${styles.stat} ${pending ? styles.statAlert : ""}`}><strong>{formatEuros(pending)}</strong><span>Pendiente de cobro</span></div>
        <div className={styles.stat}><strong>{formatEuros(monthlyCosts)}</strong><span>Costes al mes</span></div>
        <div className={styles.stat}><strong>{formatEuros(mrr - monthlyCosts)}</strong><span>Margen mensual</span></div>
      </section>

      <section className={styles.panel}>
        <h2>Pendiente de cobro</h2>
        <div className={styles.list}>
          {debtors.map((site) => (
            <Link className={styles.row} href={`/admin/webs/${site.id}`} key={site.id}>
              <span><strong>{site.name}</strong><small>{site.domain || kindLabels[site.kind]}</small></span>
              <span><strong>{formatEuros(site.pendingCents)}</strong><small>de {formatEuros(site.accruedCents)} devengado</small></span>
              <span><strong>{site.months} {site.months === 1 ? "mes" : "meses"}</strong><small>Próxima cuota: {formatDate(nextChargeOn(site))}</small></span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ))}
          {debtors.length === 0 && <div className={styles.empty}><CheckCircle2 size={26} aria-hidden="true" /><p>Todo cobrado.</p></div>}
        </div>
        {sites.some((site) => !site.startedOn) && (
          <p className="notice">Hay webs sin fecha de alta: no se les calcula ninguna cuota hasta que la indiques.</p>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Renovaciones de dominio (60 días)</h2>
        <div className={styles.list}>
          {renewals.map((domain) => (
            <Link className={styles.row} href={`/admin/webs/${domain.siteId}`} key={domain.id}>
              <span><strong>{domain.name}</strong><small>{domain.siteName}</small></span>
              <span><strong>{formatDate(domain.renewsOn)}</strong><small>{domain.registrar || "Registrador sin indicar"}</small></span>
              <span>
                <span className={`${styles.tag} ${domain.days < 0 ? styles.tagDanger : domain.days <= 30 ? styles.tagWarn : ""}`}>
                  {domain.days < 0 ? `Vencido hace ${-domain.days} días` : domain.days === 0 ? "Hoy" : `En ${domain.days} días`}
                </span>
                <small>{domain.autoRenew ? "Renovación automática" : "Renovación manual"}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ))}
          {renewals.length === 0 && <div className={styles.empty}><CalendarClock size={26} aria-hidden="true" /><p>No hay renovaciones en los próximos 60 días (o faltan fechas por indicar).</p></div>}
        </div>
      </section>
    </>
  );
}
