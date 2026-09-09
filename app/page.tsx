import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Trazo · Creación de páginas web" },
  description:
    "Trazo crea páginas web cuidadas, claras y hechas a medida para cada negocio.",
};

export default function HomePage() {
  return (
    <main id="contenido" className={`${styles.hero} landing-page`}>
      <div className={styles.content}>
        <Brand href="/" className="brand-hero" />
        <hr className={styles.accent} />
        <h1>Creación de páginas web</h1>
      </div>
      <footer className={styles.heroFooter}>
        <span>Trazo · Diseño web con intención</span>
        <nav aria-label="Información legal">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/aviso-legal">Aviso legal</Link>
        </nav>
      </footer>
    </main>
  );
}
