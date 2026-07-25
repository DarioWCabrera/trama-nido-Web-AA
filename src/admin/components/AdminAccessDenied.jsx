import { useState } from "react";
import { signOutAdmin } from "../services/adminService";

export default function AdminAccessDenied({ email, message }) {
  const [leaving, setLeaving] = useState(false);

  const handleSignOut = async () => {
    setLeaving(true);
    try {
      await signOutAdmin();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card admin-denied-card">
        <span className="admin-denied-icon" aria-hidden="true">!</span>
        <span className="eyebrow">Acceso restringido</span>
        <h1>Esta cuenta no tiene permisos de administración.</h1>
        <p>
          {message || `La cuenta ${email ?? "ingresada"} inició sesión, pero no figura en admin_users.`}
        </p>
        <button className="admin-primary-button" type="button" onClick={handleSignOut} disabled={leaving}>
          {leaving ? "Cerrando…" : "Cerrar sesión e intentar otra vez"}
        </button>
      </section>
    </main>
  );
}
