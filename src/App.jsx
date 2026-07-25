import Storefront from "./pages/Storefront";
import AdminApp from "./admin/AdminApp";

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return isAdminRoute ? <AdminApp /> : <Storefront />;
}
