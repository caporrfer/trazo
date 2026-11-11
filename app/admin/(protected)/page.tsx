import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Badge, Empty, PageHead, Panel, Stat } from "@/components/admin/ui";
import { formatDate, formatEuros, kindLabels, monthlyEquivalentCents, nextChargeOn } from "@/lib/billing";
import { listCosts, listPayments, listSites, upcomingRenewals } from "@/lib/db";

const today = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function DashboardPage() {
  const sites = listSites();
  const active = sites.filter((site) => !site.endedOn);
  const names = new Map(listSites({ includeArchived: true }).map((site) => [site.id, site.name]));
  const mrr = active.reduce((sum, site) => sum + site.monthlyCents, 0);
  const payments = listPayments();
  const collected = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const pending = sites.reduce((sum, site) => sum + Math.max(0, site.pendingCents), 0);
  const generalCosts = listCosts().filter((cost) => !cost.siteId).reduce((sum, cost) => sum + monthlyEquivalentCents(cost.amountCents, cost.period), 0);
  const monthlyCosts = generalCosts + sites.reduce((sum, site) => sum + site.monthlyCostCents, 0);
  const debtors = sites.filter((site) => site.pendingCents > 0).sort((a, b) => b.pendingCents - a.pendingCents);
  const renewals = upcomingRenewals(60);
  const date = today.format(new Date());

  return (
    <>
      <PageHead kicker={date.charAt(0).toUpperCase() + date.slice(1)} title="Resumen" />
      <section className={styles.stats} aria-label="Indicadores">
        <Stat label="Pendiente de cobro" value={formatEuros(pending)} hint={`${debtors.length} ${debtors.length === 1 ? "cliente" : "clientes"}`} tone={pending ? "alert" : "good"} />
        <Stat label="Total cobrado" value={formatEuros(collected)} hint={`${payments.length} ${payments.length === 1 ? "cobro" : "cobros"}`} />
        <Stat label="Ingresos al mes" value={formatEuros(mrr)} hint={`${active.length} webs activas`} />
        <Stat label="Margen al mes" value={formatEuros(mrr - monthlyCosts)} hint={`Costes ${formatEuros(monthlyCosts)}/mes`} />
      </section>

      <div className={styles.columns}>
        <Panel title="Pendiente de cobro" aside={debtors.length ? formatEuros(pending) : undefined}>
          {debtors.length ? (
            <ul className={styles.rows}>
              {debtors.map((site) => (
                <li key={site.id}>
                  <Link href={`/admin/webs/${site.id}`} className={styles.rowLink}>
                    <span><strong>{site.name}</strong><small>{site.domain || kindLabels[site.kind]}</small></span>
                    <span className={styles.right}><strong className={styles.amountDanger}>{formatEuros(site.pendingCents)}</strong><small>Próxima cuota {formatDate(nextChargeOn(site))}</small></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty>Todo cobrado.</Empty>}
          {sites.some((site) => !site.startedOn) && <p className={styles.footnote}>Hay webs sin fecha de alta: no generan cuotas hasta que se indique.</p>}
        </Panel>

        <Panel title="Renovaciones de dominio" aside="60 días">
          {renewals.length ? (
            <ul className={styles.rows}>
              {renewals.map((domain) => (
                <li key={domain.id}>
                  <Link href={`/admin/webs/${domain.siteId}`} className={styles.rowLink}>
                    <span><strong>{domain.name}</strong><small>{domain.siteName} · {domain.registrar || "registrador sin indicar"}</small></span>
                    <span className={styles.right}>
                      <Badge tone={domain.days < 0 ? "danger" : domain.days <= 30 ? "warn" : undefined}>
                        {domain.days < 0 ? `Vencido hace ${-domain.days} d` : domain.days === 0 ? "Hoy" : `En ${domain.days} días`}
                      </Badge>
                      <small>{formatDate(domain.renewsOn)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty>Ninguna renovación en los próximos 60 días.</Empty>}
        </Panel>
      </div>

      <Panel title="Últimos cobros" aside={<Link href="/admin/cobros">Ver todos →</Link>}>
        {payments.length ? (
          <ul className={styles.rows}>
            {payments.slice(0, 5).map((payment) => (
              <li key={payment.id} className={styles.rowStatic}>
                <span><strong>{names.get(payment.siteId)}</strong><small>{formatDate(payment.paidOn)}{payment.notes ? ` · ${payment.notes}` : ""}</small></span>
                <strong className={styles.amountGood}>+{formatEuros(payment.amountCents)}</strong>
              </li>
            ))}
          </ul>
        ) : <Empty>Todavía no hay cobros registrados.</Empty>}
      </Panel>
    </>
  );
}
