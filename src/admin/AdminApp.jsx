import AdminAccessDenied from "./components/AdminAccessDenied";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoader from "./components/AdminLoader";
import AdminLogin from "./components/AdminLogin";
import AdminResetPassword from "./components/AdminResetPassword";
import { useAdminAuth } from "./hooks/useAdminAuth";

function AdminProtectedApp() {
  const { session, isAdmin, loading, error } = useAdminAuth();

  if (loading) return <AdminLoader />;
  if (!session) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <AdminAccessDenied
        email={session.user.email}
        message={error}
      />
    );
  }

  return <AdminDashboard session={session} />;
}

export default function AdminApp() {
  const isResetRoute = window.location.pathname === "/admin/reset-password";

  return isResetRoute ? <AdminResetPassword /> : <AdminProtectedApp />;
}
