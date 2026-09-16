import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { listAdminWebsites } from "@/lib/repository";
import { formatEuroCents } from "@/lib/admin-content";
import styles from "@/components/admin/Admin.module.css";

export default async function DomainsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  let websites = [] as Awaited<ReturnType<typeof listAdminWebsites>>;
  let loadError = false;
  try { websites = await listAdminWebsites({ q: query.q, pending: query.pending === "1", renewal: query.renewal === "1" }); } catch (error) { console.error("No se han podido cargar los dominios", error); loadError = true; }
  const pending = websites.filter((website) => website.pendingMonths > 0).length;
  const renewals = websites.filter((website) => website.domains.some((domain) => ["soon", "today", "overdue"].includes(domain.renewalStatus))).length;
  return <>
    <div className={styles.topline}><div><h1>Dominios</h1><p>Webs activas, renovaciones y mantenimiento.</p></div><Link className="button button-primary" href="/admin/dominios/nueva">Nueva web</Link></div>
    {loadError && <p className="notice error-notice">La sección necesita la migración de dominios de Supabase. Cuando esté aplicada, los datos y facturas aparecerán aquí.</p>}
    <section className={styles.stats} aria-label="Indicadores de dominios">
      <div className={styles.stat}><strong>{websites.length}</strong><span>Webs gestionadas</span></div>
      <div className={styles.stat}><strong>{pending}</strong><span>Con meses pendientes</span></div>
      <div className={styles.stat}><strong>{renewals}</strong><span>Renovaciones próximas</span></div>
      <div className={styles.stat}><strong>{formatEuroCents(websites.reduce((sum, website) => sum + website.totalPaidCents, 0))}</strong><span>Cobrado registrado</span></div>
    </section>
    <form className={styles.filterForm}>
      <div className={styles.filterPrimary}><label className={styles.field}><span className="sr-only">Buscar negocio o dominio</span><input className={styles.input} name="q" defaultValue={query.q} placeholder="Buscar negocio o dominio" /></label><button className="button button-secondary" type="submit">Buscar</button></div>
      <div className={styles.filterGrid}><label className={styles.field}><span><input type="checkbox" name="pending" value="1" defaultChecked={query.pending === "1"} /> Meses pendientes</span></label><label className={styles.field}><span><input type="checkbox" name="renewal" value="1" defaultChecked={query.renewal === "1"} /> Renovaciones próximas</span></label><button className="button button-secondary" type="submit">Aplicar filtros</button></div>
    </form>
    <section className={styles.panel}><h2>Webs contratadas</h2><div className={styles.list}>{websites.map((website) => <Link className={styles.row} href={`/admin/dominios/${website.id}`} key={website.id}><span><strong>{website.businessName}</strong><small>{website.websiteUrl || "URL pendiente"}</small></span><span><strong>{website.activeDays === undefined ? "Pendiente de activar" : `${website.completeMonths} meses · ${website.activeDays} días`}</strong><small>{website.domains.length} dominio{website.domains.length === 1 ? "" : "s"}</small></span><span><strong>{website.pendingMonths ? `${website.pendingMonths} meses pendientes` : "Al día"}</strong><small>{website.maintenanceMonthlyCents ? `${formatEuroCents(website.maintenanceMonthlyCents)}/mes` : "Sin cuota"}</small></span><span><ArrowRight size={18} aria-hidden="true" /></span></Link>)}{websites.length === 0 && <div className={styles.empty}><Globe2 size={28} aria-hidden="true" /><p>No hay webs que coincidan con la búsqueda.</p></div>}</div></section>
    {websites.some((website) => website.domains.some((domain) => domain.renewalStatus === "overdue")) && <p className="notice error-notice">Hay dominios con renovación vencida. Revisa sus fichas.</p>}
  </>;
}
