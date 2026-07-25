import AdminAccessDenied from "./components/AdminAccessDenied";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoader from "./components/AdminLoader";
import AdminLogin from "./components/AdminLogin";
import { useAdminAuth } from "./hooks/useAdminAuth";

export default function AdminApp() {
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
