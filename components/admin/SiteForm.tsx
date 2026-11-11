import type { Site } from "@/lib/db";
import { kindLabels } from "@/lib/billing";
import styles from "./Admin.module.css";

const euros = (cents?: number) => (cents ? (cents / 100).toFixed(2).replace(".", ",") : "");

export function SiteForm({ site, action, submit }: { site?: Site; action: (formData: FormData) => Promise<void>; submit: string }) {
  return (
    <form action={action} className={styles.form}>
      {site && <input type="hidden" name="id" value={site.id} />}
      <div className={styles.formGrid}>
        <label className={styles.field}><span>Nombre del cliente</span><input className={styles.input} name="name" required defaultValue={site?.name} /></label>
        <label className={styles.field}><span>Dominio principal</span><input className={styles.input} name="domain" placeholder="ejemplo.es" defaultValue={site?.domain} /></label>
        <label className={styles.field}><span>URL</span><input className={styles.input} name="url" type="url" placeholder="https://ejemplo.es" defaultValue={site?.url} /></label>
        <label className={styles.field}><span>Tipo</span>
          <select className={styles.input} name="kind" defaultValue={site?.kind || "informativa"}>
            {Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.field}><span>Fecha de alta</span><input className={styles.input} name="startedOn" type="date" defaultValue={site?.startedOn || ""} /></label>
        <label className={styles.field}><span>Fecha de baja</span><input className={styles.input} name="endedOn" type="date" defaultValue={site?.endedOn || ""} /></label>
        <label className={styles.field}><span>Cuota mensual (€)</span><input className={styles.input} name="monthly" inputMode="decimal" placeholder="29" defaultValue={euros(site?.monthlyCents)} /></label>
        <label className={styles.field}><span>Desarrollo (€)</span><input className={styles.input} name="setup" inputMode="decimal" placeholder="190" defaultValue={euros(site?.setupCents)} /></label>
        <label className={`${styles.field} ${styles.wide}`}><span>Dónde está alojada</span><input className={styles.input} name="hosting" placeholder="VPS, proveedor, servidor…" defaultValue={site?.hosting} /></label>
        <label className={`${styles.field} ${styles.wide}`}><span>Notas</span><textarea className={styles.input} name="notes" rows={3} defaultValue={site?.notes} /></label>
      </div>
      <button className="button button-primary" type="submit">{submit}</button>
    </form>
  );
}
