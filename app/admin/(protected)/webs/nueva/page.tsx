import Link from "next/link";
import styles from "@/components/admin/Admin.module.css";
import { Flash } from "@/components/admin/Flash";
import { SiteForm } from "@/components/admin/SiteForm";
import { createSiteAction } from "../../actions";

export default async function NewSitePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <div className={styles.topline}>
        <div><h1>Nueva web</h1><p>Después podrás añadir dominios, costes y cobros.</p></div>
        <Link className="button button-quiet" href="/admin/webs">Volver</Link>
      </div>
      <Flash error={error} />
      <section className={styles.panel}><SiteForm action={createSiteAction} submit="Crear web" /></section>
    </>
  );
}
