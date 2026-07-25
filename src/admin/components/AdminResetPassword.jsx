import { useEffect, useState } from "react";
import {
  getCurrentSession,
  signOutAdmin,
  subscribeToAuthChanges,
  updateAdminPassword,
} from "../services/adminService";

const MIN_PASSWORD_LENGTH = 8;

export default function AdminResetPassword() {
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let settled = false;

    const acceptSession = (session) => {
      if (!active || !session?.user) return;
      settled = true;
      setSessionReady(true);
      setChecking(false);
    };

    getCurrentSession()
      .then((session) => {
        if (!active) return;
        if (session?.user) {
          acceptSession(session);
          return;
        }

        window.setTimeout(() => {
          if (!active || settled) return;
          setChecking(false);
          setError(
            "El enlace no es válido o ya venció. Solicitá uno nuevo desde el panel.",
          );
        }, 2500);
      })
      .catch(() => {
        if (!active) return;
        setChecking(false);
        setError(
          "No pudimos verificar el enlace. Solicitá uno nuevo desde el panel.",
        );
      });

    const unsubscribe = subscribeToAuthChanges((session, event) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        acceptSession(session);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await updateAdminPassword(password);
      await signOutAdmin();
      window.location.replace("/admin?password-reset=success");
    } catch (updateError) {
      setError(
        updateError?.message ||
          "No pudimos actualizar la contraseña. Pedí un enlace nuevo e intentá otra vez.",
      );
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

        <div className="admin-login-copy admin-recovery-copy">
          <span className="eyebrow">Nueva contraseña</span>
          <h1>Elegí una clave nueva.</h1>
          <p>
            Usá al menos ocho caracteres y evitá una contraseña que ya utilices
            en otros servicios.
          </p>
        </div>

        {checking ? (
          <div className="admin-reset-checking" aria-live="polite">
            <div className="admin-spinner" aria-hidden="true" />
            <p>Verificando el enlace de recuperación…</p>
          </div>
        ) : sessionReady ? (
          <form className="admin-form admin-login-form" onSubmit={handleSubmit}>
            <label>
              <span>Contraseña nueva</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            <label>
              <span>Repetir contraseña</span>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                placeholder="Repetí la contraseña"
              />
            </label>

            <label className="admin-password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              <span>Mostrar contraseñas</span>
            </label>

            {error && <p className="admin-message is-error">{error}</p>}

            <button
              className="admin-primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Guardando…" : "Guardar contraseña nueva"}
            </button>
          </form>
        ) : (
          <>
            {error && <p className="admin-message is-error">{error}</p>}
            <a className="admin-primary-button" href="/admin">
              Solicitar un enlace nuevo
            </a>
          </>
        )}

        <a className="admin-back-link" href="/admin">← Volver al panel</a>
      </section>
    </main>
  );
}
