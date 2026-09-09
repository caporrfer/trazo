export default function AdminLoading() {
  return (
    <section aria-busy="true">
      <h1>Administración</h1>
      <p className="notice" role="status">
        Cargando los datos…
      </p>
    </section>
  );
}
