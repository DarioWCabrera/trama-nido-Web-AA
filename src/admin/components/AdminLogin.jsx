import { useState } from "react";
import { signInAdmin } from "../services/adminService";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email, password);
    } catch (loginError) {
      setError(
        loginError?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : loginError?.message || "No pudimos iniciar sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <a className="admin-brand" href="/" aria-label="Volver a Trama Nido">
          <img src="/assets/logo-trama-nido.webp" alt="Trama Nido" />
          <div>
            <strong>Trama Nido</strong>
            <span>Panel de administración</span>
          </div>
        </a>

        <div className="admin-login-copy">
          <span className="eyebrow">Acceso privado</span>
          <h1>Administrá la tienda desde acá.</h1>
          <p>
            Ingresá con el correo y la contraseña creados en Supabase.
          </p>
        </div>

        <form className="admin-form admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="romina@correo.com"
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </label>

          {error && <p className="admin-message is-error">{error}</p>}

          <button className="admin-primary-button" type="submit" disabled={submitting}>
            {submitting ? "Ingresando…" : "Ingresar al panel"}
          </button>
        </form>

        <a className="admin-back-link" href="/">← Volver a la tienda</a>
      </section>
    </main>
  );
}
