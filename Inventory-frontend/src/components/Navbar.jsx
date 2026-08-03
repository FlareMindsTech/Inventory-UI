import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await signOut();
    showToast("Logged out successfully", "success");
    navigate("/login");
  };

  return (
    <div className="h-16 bg-white border-b border-brand-100 px-6 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-brand-900">{user?.name || "User"}</p>
          <p className="text-xs text-brand-400 capitalize">{user?.role || user?.roleName}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-200 flex items-center justify-center text-brand-600 font-semibold text-sm">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-500 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}