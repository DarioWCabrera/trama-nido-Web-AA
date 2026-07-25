import { useMemo, useState } from "react";
import {
  sendPasswordResetEmail,
  signInAdmin,
} from "../services/adminService";

export default function AdminLogin() {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordResetSuccess = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("password-reset") === "success";
  }, []);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const showLogin = () => {
    clearFeedback();
    setView("login");
  };

  const showRecovery = () => {
    clearFeedback();
    setView("recovery");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
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

  const handleRecovery = async (event) => {
    event.preventDefault();
    clearFeedback();
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      setMessage(
        "Te enviamos un enlace para restablecer la contraseña. Revisá también la carpeta de correo no deseado.",
      );
    } catch (recoveryError) {
      setError(
        recoveryError?.message ||
          "No pudimos enviar el correo de recuperación. Intentá nuevamente.",
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

        {view === "login" ? (
          <>
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

              {passwordResetSuccess && !message && (
                <p className="admin-message is-success">
                  Contraseña actualizada. Ya podés ingresar con la nueva clave.
                </p>
              )}
              {error && <p className="admin-message is-error">{error}</p>}
              {message && <p className="admin-message is-success">{message}</p>}

              <button
                className="admin-primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Ingresando…" : "Ingresar al panel"}
              </button>

              <button
                className="admin-forgot-button"
                type="button"
                onClick={showRecovery}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="admin-login-copy admin-recovery-copy">
              <span className="eyebrow">Recuperar acceso</span>
              <h1>Restablecé tu contraseña.</h1>
              <p>
                Ingresá el correo del administrador y te enviaremos un enlace
                seguro para elegir una contraseña nueva.
              </p>
            </div>

            <form className="admin-form admin-login-form" onSubmit={handleRecovery}>
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

              {error && <p className="admin-message is-error">{error}</p>}
              {message && <p className="admin-message is-success">{message}</p>}

              <button
                className="admin-primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Enviando…" : "Enviar enlace de recuperación"}
              </button>

              <button
                className="admin-forgot-button"
                type="button"
                onClick={showLogin}
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          </>
        )}

        <a className="admin-back-link" href="/">← Volver a la tienda</a>
      </section>
    </main>
  );
}
