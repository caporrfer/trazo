import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "@/components/admin/Admin.module.css";
import { createProposal } from "../../actions";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Link className={styles.back} href="/admin/propuestas">
        <ArrowLeft size={18} />
        Volver a propuestas
      </Link>
      <h1>Nueva propuesta</h1>
      <p className="muted">
        Puedes guardar un borrador incompleto. Nombre, tipo, slug y demo serán
        obligatorios al activarlo.
      </p>
      {error && (
        <p className="notice error-notice" role="alert">
          {error === "invalid"
            ? "Revisa los campos. El slug usa minúsculas, números y guiones; indica una URL de demo válida."
            : "No hemos podido guardar la propuesta."}
        </p>
      )}
      <form className={styles.panel} action={createProposal}>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="businessName">
              Nombre del negocio{" "}
              <span className="muted">(puede completarse después)</span>
            </label>
            <input
              className={styles.input}
              id="businessName"
              name="businessName"
              maxLength={140}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="businessType">
              Tipo de negocio{" "}
              <span className="muted">(puede completarse después)</span>
            </label>
            <input
              className={styles.input}
              id="businessType"
              name="businessType"
              defaultValue="Restaurante"
              maxLength={80}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="slug">
            Slug del enlace{" "}
            <span className="muted">(puede completarse después)</span>
          </label>
          <input
            className={styles.input}
            id="slug"
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="restaurante-paco"
          />
          <span className="muted">
            No podrá cambiarse después de activar la propuesta.
          </span>
        </div>
        <div className={styles.field}>
          <label htmlFor="demoUrl">
            URL de la demo{" "}
            <span className="muted">(puede completarse después)</span>
          </label>
          <input
            className={styles.input}
            id="demoUrl"
            name="demoUrl"
            type="text"
            inputMode="url"
            placeholder="demo-restaurante-paco.vercel.app"
          />
        </div>
        <button className="button button-primary" type="submit">
          Guardar borrador
        </button>
      </form>
    </>
  );
}
