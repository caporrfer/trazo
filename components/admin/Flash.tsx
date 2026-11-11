export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="notice error-notice" role="alert">{error}</p>;
  if (ok) return <p className="notice" role="status">{ok}</p>;
  return null;
}
