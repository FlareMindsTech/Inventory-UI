import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Input from "../../components/input";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";

export default function CatalogList({ title, nameLabel, nameField, fetchAll, create, update, remove }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAll();
      const list = res.Result || res.data || res.result || res;
      setItems(Array.isArray(list) ? list : []);
    } catch {
      showToast(`Failed to load ${title.toLowerCase()}`, "error");
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

 const getId = (item) => item.id ?? item._id ?? item.categoryId ?? item.brandId;

  const openAdd = () => { setEditing(null); setIsFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setIsFormOpen(true); };

  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await update(getId(editing), formData);
        showToast(`${title.slice(0, -1)} updated`, "success");
      } else {
        await create(formData);
        showToast(`${title.slice(0, -1)} added`, "success");
      }
      setIsFormOpen(false);
      load();
    } catch (err) {
      showToast(err?.response?.data?.Message || "Something went wrong", "error");
    }
  };


const handleDelete = async () => {
 
  try {
    await remove(getId(deleting));
    showToast(`${title.slice(0, -1)} removed`, "success");
    load();
  } catch (err) {
    showToast(err?.response?.data?.Message || "Failed to remove", "error");
  }
  setDeleting(null);
};
  const columns = [
    { key: "name", label: nameLabel, render: (row) => <span className="text-brand-900 font-medium">{row[nameField]}</span> },
    
    {
      key: "action", label: "Actions", align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openEdit(row)} className="text-brand-600 text-xs font-semibold hover:underline">Edit</button>
          <button onClick={() => setDeleting(row)} className="text-red-500 text-xs font-semibold hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/products")} className="text-brand-400 hover:text-brand-900 text-sm">← Back</button>
          <p className="text-xl font-bold text-brand-900">{title}</p>
        </div>
        <button onClick={openAdd} className="bg-brand-600 hover:bg-brand-800 text-white rounded-lg px-4 py-2.5 text-sm font-semibold">
          + Add {title.slice(0, -1)}
        </button>
      </div>

      <div className="p-6">
        <Card>
          <Table columns={columns} data={items} isLoading={isLoading} emptyMessage={`No ${title.toLowerCase()} yet`} />
        </Card>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}>
        <CatalogForm initialData={editing} nameLabel={nameLabel} nameField={nameField} onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Remove ${title.slice(0, -1).toLowerCase()}?`}
        message={`Are you sure you want to remove "${deleting?.[nameField]}"?`}
      />
    </div>
  );
}

function CatalogForm({ initialData, nameLabel, nameField, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData || { [nameField]: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSubmit(form);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label={nameLabel} value={form[nameField]} onChange={(e) => setForm((p) => ({ ...p, [nameField]: e.target.value }))} required />
      <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}