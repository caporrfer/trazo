import styles from "./Admin.module.css";

export function PageHead({ kicker, title, children }: { kicker?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.pageHead}>
      {kicker && <p className={styles.kicker}>{kicker}</p>}
      <h1>{title}</h1>
      {children && <div className={styles.pageSub}>{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "alert" | "good" }) {
  return (
    <div className={`${styles.stat} ${tone === "alert" ? styles.statAlert : tone === "good" ? styles.statGood : ""}`}>
      <span className={styles.statLabel}>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Panel({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>{title}</h2>
        {aside && <span className={styles.panelAside}>{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}

export function Badge({ children, tone }: { children: React.ReactNode; tone?: "warn" | "danger" | "muted" }) {
  return <span className={`${styles.badge} ${tone ? styles[`badge_${tone}`] : ""}`}>{children}</span>;
}
