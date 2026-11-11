import { addCostAction } from "@/app/admin/(protected)/actions";
import { periodLabels } from "@/lib/billing";
import styles from "./Admin.module.css";

export function CostForm({ sites, siteId, back }: { sites?: { id: string; name: string }[]; siteId?: string; back: string }) {
  return (
    <form action={addCostAction} className={styles.form}>
      <input type="hidden" name="back" value={back} />
      {siteId && <input type="hidden" name="siteId" value={siteId} />}
      <div className={styles.formGrid}>
        {sites && (
          <label className={styles.field}><span>Web</span>
            <select className={styles.input} name="siteId" defaultValue="">
              <option value="">General (compartido)</option>
              {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </label>
        )}
        <label className={styles.field}><span>Concepto</span><input className={styles.input} name="concept" required placeholder="VPS, plugin, correo…" /></label>
        <label className={styles.field}><span>Proveedor</span><input className={styles.input} name="provider" placeholder="Hetzner, OVH…" /></label>
        <label className={styles.field}><span>Importe (€)</span><input className={styles.input} name="amount" inputMode="decimal" required /></label>
        <label className={styles.field}><span>Periodicidad</span>
          <select className={styles.input} name="period" defaultValue="mensual">
            {Object.entries(periodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={`${styles.field} ${styles.wide}`}><span>Notas</span><input className={styles.input} name="notes" /></label>
      </div>
      <button className="button button-secondary" type="submit">Añadir coste</button>
    </form>
  );
}
