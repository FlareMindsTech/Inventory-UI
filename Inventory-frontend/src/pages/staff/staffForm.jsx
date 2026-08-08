import { useState } from "react";
import Input from "../../components/input";
import Button from "../../components/Button";
import FieldError from "../../components/shared/FieldError";
import PasswordHints from "../../components/shared/passwordHints";
import { strongPassword } from "../../utilis/validator";

export default function StaffForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "STAFF",
    }
  );
  const [passwordError, setPasswordError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field) => (e) => {
  const value = e.target.value;
  setForm((prev) => ({ ...prev, [field]: value }));

  if (field === "password") {
    setPasswordError(strongPassword()(value));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialData) {
      const error = strongPassword()(form.password);
      if (error) {
        setPasswordError(error);
        return;
      }
    }
    setPasswordError("");

    setIsSaving(true);
    await onSubmit(form);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Full name" value={form.name} onChange={handleChange("name")} placeholder="e.g. Jane Doe" required />
      <Input label="Username" value={form.username} onChange={handleChange("username")} placeholder="janedoe" required />
      <Input label="Email" type="email" value={form.email} onChange={handleChange("email")} placeholder="jane@example.com" required />
      <Input label="Phone" value={form.phoneNumber} onChange={handleChange("phoneNumber")} placeholder="+919876543210" required />

      {!initialData && (
        <div>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Enter a password"
            required
          />
          <PasswordHints value={form.password} />
          <FieldError message={passwordError} />
        </div>
      )}

      <label className="text-sm font-medium text-brand-900 block mb-1.5">Role</label>
      <select
        value={form.role}
        onChange={handleChange("role")}
        className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white mb-5 focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <option value="STAFF">Staff</option>
        <option value="ADMIN">Admin</option>
      </select>

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>
          {isSaving ? "Saving..." : initialData ? "Update staff" : "Add staff"}
        </Button>
      </div>
    </form>
  );
}