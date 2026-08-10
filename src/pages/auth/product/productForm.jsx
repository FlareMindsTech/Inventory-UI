import { useState } from "react";
import Input from "../../../components/input";
import Button from "../../../components/Button";
import FieldError from "../../../components/shared/FieldError";
import {
  required,
  minLengthText,
  positiveNumber,
  nonNegativeNumber,
  maxNumber,
  positiveInteger,
} from "../../../utilis/validator";

const sizeOptions = ["S", "M", "L", "XL", "XXL", "Free"];
const gstOptions = [0, 5, 12, 18, 28];

export default function ProductForm({ initialData, categories, brands, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      productName: "",
      categoryId: "",
      brandId: "",
      size: "",
      color: "",
      mrp: "",
      gst: "",
      discount: 0,
      costPrice: "",
      quantity: "",
    }
  );
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fieldValidators = {
    productName: [required("Product name is required"), minLengthText(2, "Name is too short")],
    mrp: [required("MRP is required"), positiveNumber("MRP must be a positive number")],
    costPrice: [nonNegativeNumber("Cost price cannot be negative")],
    discount: [nonNegativeNumber("Discount cannot be negative"), maxNumber(100, "Discount cannot exceed 100%")],
    ...(!initialData && {
      quantity: [required("Initial stock quantity is required"), positiveInteger()],
    }),
  };

  const validateField = (field, value) => {
    const validatorList = fieldValidators[field];
    if (!validatorList) return "";
    for (const validate of validatorList) {
      const error = validate(value);
      if (error) return error;
    }
    return "";
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(fieldValidators).forEach((field) => {
      newErrors[field] = validateField(field, form[field]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSaving(true);

    const submitData = {
      productName: form.productName.trim(),
      categoryId: form.categoryId,
      brandId: form.brandId,
      size: form.size,
      color: form.color,
      mrp: Number(form.mrp),
      gst: Number(form.gst) || 0,
      discount: Number(form.discount) || 0,
      costPrice: Number(form.costPrice) || 0,
      ...(!initialData && { quantity: Number(form.quantity) }),
    };

    await onSubmit(submitData);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <Input label="Product name" value={form.productName} onChange={handleChange("productName")} placeholder="e.g. Men's Cotton Shirt" required />
        <FieldError message={errors.productName} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-sm font-medium text-brand-900 block mb-1.5">Category *</label>
          <select value={form.categoryId} onChange={handleChange("categoryId")} className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" required>
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.categoryName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-900 block mb-1.5">Brand *</label>
          <select value={form.brandId} onChange={handleChange("brandId")} className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" required>
            <option value="">Select brand</option>
            {brands?.map((b) => (
              <option key={b._id ?? b.id} value={b._id ?? b.id}>{b.brandName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-sm font-medium text-brand-900 block mb-1.5">Size *</label>
          <select value={form.size} onChange={handleChange("size")} className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" required>
            <option value="">Select size</option>
            {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Input label="Color *" value={form.color} onChange={handleChange("color")} placeholder="Blue" required />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <Input label="MRP (₹) *" type="number" value={form.mrp} onChange={handleChange("mrp")} placeholder="0" required />
          <FieldError message={errors.mrp} />
        </div>
        <div>
          <Input label="Cost price (₹)" type="number" value={form.costPrice} onChange={handleChange("costPrice")} placeholder="0" />
          <FieldError message={errors.costPrice} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-sm font-medium text-brand-900 block mb-1.5">GST (%)</label>
          <select value={form.gst} onChange={handleChange("gst")} className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Select GST</option>
            {gstOptions.map((g) => <option key={g} value={g}>{g}%</option>)}
          </select>
        </div>
        <div>
          <Input label="Discount (%)" type="number" value={form.discount} onChange={handleChange("discount")} placeholder="0" />
          <FieldError message={errors.discount} />
        </div>
      </div>

      {!initialData && (
        <div>
          <Input
            label="Initial stock quantity *"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange("quantity")}
            placeholder="e.g. 100"
            required
          />
          <FieldError message={errors.quantity} />
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>
          {isSaving ? "Saving..." : initialData ? "Update product" : "Add product & stock"}
        </Button>
      </div>
    </form>
  );
}