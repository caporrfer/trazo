import { addPaymentAction } from "@/app/admin/(protected)/actions";
import { conceptLabels } from "@/lib/billing";
import styles from "./Admin.module.css";

export function PaymentForm({ sites, siteId, back, today }: { sites?: { id: string; name: string }[]; siteId?: string; back: string; today: string }) {
  return (
    <form action={addPaymentAction} className={styles.form}>
      <input type="hidden" name="back" value={back} />
      {siteId && <input type="hidden" name="siteId" value={siteId} />}
      <div className={styles.formGrid}>
        {sites && (
          <label className={styles.field}><span>Web</span>
            <select className={styles.input} name="siteId" required defaultValue="">
              <option value="" disabled>Elige una web</option>
              {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </label>
        )}
        <label className={styles.field}><span>Fecha del cobro</span><input className={styles.input} name="paidOn" type="date" required defaultValue={today} /></label>
        <label className={styles.field}><span>Importe (€)</span><input className={styles.input} name="amount" inputMode="decimal" required placeholder="29" /></label>
        <label className={styles.field}><span>Concepto</span>
          <select className={styles.input} name="concept" defaultValue="mantenimiento">
            {Object.entries(conceptLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={`${styles.field} ${styles.wide}`}><span>Notas</span><input className={styles.input} name="notes" placeholder="Bizum, transferencia, meses que cubre…" /></label>
      </div>
      <button className="button button-primary" type="submit">Registrar cobro</button>
    </form>
  );
}
