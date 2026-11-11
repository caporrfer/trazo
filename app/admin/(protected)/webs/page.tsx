import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import styles from "@/components/admin/Admin.module.css";
import { formatDate, formatEuros, kindLabels } from "@/lib/billing";
import { listSites } from "@/lib/db";

export default async function SitesPage({ searchParams }: { searchParams: Promise<{ archivadas?: string }> }) {
  const showArchived = (await searchParams).archivadas === "1";
  const sites = listSites({ includeArchived: showArchived });
  return (
    <>
      <div className={styles.topline}>
        <div><h1>Webs</h1><p>Clientes, dominios, alojamiento y saldo de cada web.</p></div>
        <Link className="button button-primary" href="/admin/webs/nueva">Nueva web</Link>
      </div>
      <section className={styles.panel}>
        <div className={styles.list}>
          {sites.map((site) => (
            <Link className={styles.row} href={`/admin/webs/${site.id}`} key={site.id}>
              <span>
                <strong>{site.name}{site.archived && <span className={styles.tag}> Archivada</span>}</strong>
                <small>{site.domain || "Sin dominio"} · {kindLabels[site.kind]}</small>
              </span>
              <span><strong>{formatEuros(site.monthlyCents)}/mes</strong><small>{site.setupCents ? `Desarrollo ${formatEuros(site.setupCents)}` : "Sin desarrollo"}</small></span>
              <span>
                <strong className={site.pendingCents > 0 ? styles.danger : undefined}>{site.pendingCents > 0 ? `Debe ${formatEuros(site.pendingCents)}` : site.pendingCents < 0 ? `A favor ${formatEuros(-site.pendingCents)}` : "Al día"}</strong>
                <small>{site.startedOn ? `Alta ${formatDate(site.startedOn)}` : "Sin fecha de alta"}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ))}
          {sites.length === 0 && <div className={styles.empty}><Globe2 size={26} aria-hidden="true" /><p>Todavía no hay webs.</p></div>}
        </div>
      </section>
      <p><Link href={showArchived ? "/admin/webs" : "/admin/webs?archivadas=1"}>{showArchived ? "Ocultar archivadas" : "Ver también las archivadas"}</Link></p>
    </>
  );
}
