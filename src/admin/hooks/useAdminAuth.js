import { useEffect, useState } from "react";
import {
  getCurrentSession,
  subscribeToAuthChanges,
  verifyAdminAccess,
} from "../services/adminService";

export function useAdminAuth() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const resolveSession = async (nextSession) => {
      if (!active) return;

      setLoading(true);
      setError("");
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const hasAccess = await verifyAdminAccess(nextSession.user.id);
        if (!active) return;
        setIsAdmin(hasAccess);
      } catch (accessError) {
        if (!active) return;
        setIsAdmin(false);
        setError(
          accessError?.message ||
            "No pudimos comprobar los permisos de administración.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    getCurrentSession()
      .then(resolveSession)
      .catch((sessionError) => {
        if (!active) return;
        setError(sessionError?.message || "No pudimos recuperar la sesión.");
        setLoading(false);
      });

    const unsubscribe = subscribeToAuthChanges(resolveSession);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    session,
    isAdmin,
    loading,
    error,
  };
}
