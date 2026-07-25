export default function AdminLoader() {
  return (
    <main className="admin-loader-page" aria-live="polite">
      <img src="/assets/logo-trama-nido.webp" alt="" />
      <div className="admin-spinner" aria-hidden="true" />
      <p>Comprobando acceso al panel…</p>
    </main>
  );
}
