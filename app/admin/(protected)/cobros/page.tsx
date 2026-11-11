import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { conceptLabels, formatDate, formatEuros, formatMonth } from "@/lib/billing";
import { todayString } from "@/lib/dates";
import { listPayments, listSites } from "@/lib/db";
import { deletePaymentAction } from "../actions";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ web?: string; error?: string }> }) {
  const { web, error } = await searchParams;
  const sites = listSites({ includeArchived: true });
  const names = new Map(sites.map((site) => [site.id, site.name]));
  const payments = listPayments(web && names.has(web) ? web : undefined);
  const byMonth = new Map<string, number>();
  for (const payment of payments) byMonth.set(payment.paidOn.slice(0, 7), (byMonth.get(payment.paidOn.slice(0, 7)) || 0) + payment.amountCents);
  const total = payments.reduce((sum, payment) => sum + payment.amountCents, 0);

  return (
    <>
      <div className={styles.topline}><div><h1>Cobros</h1><p>Todo lo que nos han pagado, para llevar la cuenta de lo recaudado.</p></div></div>
      <Flash error={error} />
      <section className={styles.panel}>
        <h2>Registrar un cobro</h2>
        <PaymentForm sites={sites.filter((site) => !site.archived)} back="/admin/cobros" today={todayString()} />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Historial · {formatEuros(total)}</h2>
          <form className={styles.inlineFilter}>
            <label className="sr-only" htmlFor="web">Filtrar por web</label>
            <select className={styles.input} id="web" name="web" defaultValue={web || ""}>
              <option value="">Todas las webs</option>
              {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
            <button className="button button-quiet" type="submit">Filtrar</button>
          </form>
        </div>
        <div className={styles.table} role="table">
          {payments.map((payment) => (
            <form action={deletePaymentAction} className={styles.tableRow} role="row" key={payment.id}>
              <input type="hidden" name="id" value={payment.id} />
              <span role="cell">{formatDate(payment.paidOn)}</span>
              <Link role="cell" href={`/admin/webs/${payment.siteId}`}>{names.get(payment.siteId)}</Link>
              <strong role="cell">{formatEuros(payment.amountCents)}</strong>
              <small role="cell">{conceptLabels[payment.concept]}{payment.notes ? ` · ${payment.notes}` : ""}</small>
              <span role="cell"><ConfirmButton /></span>
            </form>
          ))}
          {payments.length === 0 && <p className="muted">Aún no hay cobros registrados.</p>}
        </div>
      </section>

      {byMonth.size > 0 && (
        <section className={styles.panel}>
          <h2>Recaudado por mes</h2>
          <div className={styles.table} role="table">
            {[...byMonth.entries()].map(([month, cents]) => (
              <div className={styles.monthRow} role="row" key={month}>
                <span role="cell">{formatMonth(month)}</span>
                <strong role="cell">{formatEuros(cents)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
