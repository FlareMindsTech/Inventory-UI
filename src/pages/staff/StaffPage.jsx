import { useState, useEffect } from "react";
import { UserRound, Plus } from "lucide-react";
import Card from "../../components/card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useUsers } from "../../hook/useUser";
import StaffForm from "./staffForm";
import { Pencil, Trash2, KeyRound } from "lucide-react";
import Pagination from "../../components/pagination";
import FieldError from "../../components/shared/FieldError";
import PasswordHints from "../../components/shared/passwordHints";
import { strongPassword } from "../../utilis/validator";

function getUserId(user) {
  return user?.id ?? user?.userId ?? user?._id;
}

export default function StaffList() {
  const { staff, isLoading, fetchUsers, addUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { showToast } = useToast();
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddForm = () => { setEditingStaff(null); setIsFormOpen(true); };
  const openEditForm = (user) => { setEditingStaff(user); setIsFormOpen(true); };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordError("");
    setIsResetOpen(true);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordError(strongPassword()(value));
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingStaff) {
        const userId = getUserId(editingStaff);
        if (!userId) {
          showToast("Could not find this staff member's ID", "error");
          return;
        }
        const { name, email, phoneNumber, role, isActive } = formData;
        await updateUser(userId, { name, email, phoneNumber, role, isActive: isActive ?? true });
        showToast("Staff member updated", "success");
      } else {
        await addUser(formData);
        showToast("Staff member added", "success");
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err || "Something went wrong", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const userId = getUserId(deletingStaff);
      if (!userId) {
        showToast("Could not find this staff member's ID", "error");
        setDeletingStaff(null);
        return;
      }
      await deleteUser(userId);
      showToast("Staff member removed", "success");
      fetchUsers();
    } catch (err) {
      showToast(err || "Failed to remove staff member", "error");
    }
    setDeletingStaff(null);
  };

  const handleResetPassword = async () => {
    const error = strongPassword()(newPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword({ username: selectedUser.username, password: newPassword });
      showToast(`Password reset for ${selectedUser.username}`, "success");
      setIsResetOpen(false);
    } catch (err) {
      showToast(err || "Failed to reset password", "error");
    }
    setIsResetting(false);
  };

  const columns = [
    {
      key: "serial",
      label: "S.No",
      render: (_, index) => (
        <span className="text-brand-900">
          {(page - 1) * PAGE_SIZE + index + 1}
        </span>
      ),
    },
    { key: "username", label: "Username", render: (row) => <span className="text-brand-900 font-medium">{row.username}</span> },
    { key: "email", label: "Email", render: (row) => <span className="text-brand-900">{row.email}</span> },
    { key: "phoneNumber", label: "Phone", render: (row) => <span className="text-brand-900">{row.phoneNumber}</span> },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-200 text-brand-600 capitalize">
          {row.role?.toLowerCase()}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          row.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Actions",
      align: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => openEditForm(row)}
            className="p-2 rounded-lg text-brand-600 hover:bg-brand-100 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={() => openResetModal(row)}
            className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 transition-colors"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDeletingStaff(row)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
  const totalPages = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));

  const paginatedStaff = staff.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <UserRound className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-page-title">Staff</p>
            <p className="text-page-subtitle">Manage staff and admin accounts</p>
          </div>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add staff
        </button>
      </div>

      <div className="p-6">
        <Card>
          <Table
            columns={columns}
            data={paginatedStaff}
            isLoading={isLoading}
            emptyMessage="No staff members yet"
          />
          {!isLoading && staff.length > 0 && (
            <div className="flex justify-end mt-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingStaff ? "Edit staff member" : "Add staff member"}>
        <StaffForm initialData={editingStaff} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset password">
        <div className="space-y-4">
          <p className="text-sm text-brand-400">
            Username: <span className="text-brand-900 font-medium">{selectedUser?.username}</span>
          </p>

          <div>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={handlePasswordChange}
              className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <PasswordHints value={newPassword} />
            <FieldError message={passwordError} />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setIsResetOpen(false)} className="px-4 py-2 border border-brand-100 rounded-lg text-sm text-brand-900">
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={isResetting}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-800 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {isResetting ? "Resetting..." : "Reset"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove staff member?"
        message={`Are you sure you want to remove "${deletingStaff?.username}"? They'll lose access immediately.`}
      />
    </div>
  );
}