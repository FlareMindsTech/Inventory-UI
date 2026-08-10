// import { Navigate, Outlet } from "react-router-dom";

// // Dummy for now — swap for useAuth() once Redux is in
// const DUMMY_USER = { name: "Advik", role: "owner" };

// export default function ProtectedRoute({ allowedRoles }) {
//   const isAuthenticated = true; // will come from useAuth().isAuthenticated

//   if (!isAuthenticated) return <Navigate to="/login" replace />;

//   if (allowedRoles && !allowedRoles.includes(DUMMY_USER.role)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <Outlet />;
// }
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Auth state (e.g. token exists but profile hasn't loaded yet) — avoid flashing a redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <p className="text-sm text-brand-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.roleName?.toLowerCase() || user?.role?.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}