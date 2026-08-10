import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar";
import Navbar from "../Navbar";
import { sidebarConfig } from "../../config/sidebarConfig";
import { useAuth } from "../../hook/useAuth";

export default function DashboardLayout() {
  const { user } = useAuth();
  const userRole = user?.roleName?.toLowerCase() || user?.role?.toLowerCase();

  const items = userRole === "staff" ? sidebarConfig.staff : sidebarConfig.ownerAdmin;

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar items={items} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}