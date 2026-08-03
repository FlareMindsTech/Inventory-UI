import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Search, Filter as FilterIcon } from "lucide-react";
import Card from "../../../components/Card";
import Table from "../../../components/Table";
import Pagination from "../../../components/Pagination";
import MultiSelect from "../../../components/MultiSelect";
import Chip from "../../../components/Chip";
import Modal from "../../../components/Modal";
import ConfirmDialog from "../../../components/ConfirmDialog";
import DateRangePicker from "../../../components/DateRangerPicker";
import { useProducts } from "../../../hook/useproduct";
import { useFactoryInventory } from "../../../hook/useFactoryInventory";
import { useToast } from "../../../context/ToastContext";
import ProductForm from "./productForm";
import BarcodeLabel from "../../../components/BarcodeLabel";

const PAGE_SIZE = 10;

export default function ProductList() {
  const {
    products, categories, brands, isLoading,
    fetchProducts, fetchCategories, fetchBrands,
    addProduct, updateProduct, deleteProduct,
  } = useProducts();
  const { fetchFactoryInventory, addProducedStock } = useFactoryInventory();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [newlyAddedProduct, setNewlyAddedProduct] = useState(null);
  const [printQty, setPrintQty] = useState(1);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCategories();
        await fetchBrands();
        await fetchProducts();
        await fetchFactoryInventory();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const getCategoryName = (product) => {
    if (!product) return "—";
    if (product.categoryId && typeof product.categoryId === "object") {
      return product.categoryId.categoryName || "—";
    }
    const category = categories.find((c) => String(c._id ?? c.id) === String(product.categoryId));
    return category?.categoryName || "—";
  };

  const getBrandName = (product) => {
    if (!product) return "—";
    if (product.brandId && typeof product.brandId === "object") {
      return product.brandId.brandName || "—";
    }
    const brand = brands.find((b) => String(b._id ?? b.id) === String(product.brandId));
    return brand?.brandName || "—";
  };

  const getFormattedPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : Number(price);
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);

    const matchesProductName =
      !productNameFilter ||
      p.productName?.toLowerCase().includes(productNameFilter.toLowerCase());

    const categoryName = getCategoryName(p);
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(categoryName);

    let matchesDate = true;
    if (dateRange.start && p.createdAt) {
      const productDate = new Date(p.createdAt);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);
      end.setHours(23, 59, 59, 999);
      matchesDate = productDate >= start && productDate <= end;
    }

    return matchesSearch && matchesProductName && matchesCategory && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalStockValue = products.reduce((sum, p) => sum + getFormattedPrice(p.mrp), 0);
  const lowStockCount = products.filter((p) => p.status === "LowStock" || p.status === "OutOfStock").length;

  const openAddForm = () => { setEditingProduct(null); setIsFormOpen(true); };

  const openEditForm = (product) => {
    setEditingProduct({
      ...product,
      categoryId: typeof product.categoryId === "object" ? product.categoryId._id : product.categoryId,
      brandId: typeof product.brandId === "object" ? product.brandId._id : product.brandId,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const { quantity, ...productFields } = formData;

      if (editingProduct) {
        await updateProduct(editingProduct.productId, productFields);
        showToast("Product updated successfully", "success");
        setIsFormOpen(false);
        await fetchProducts();
        return;
      }

      const created = await addProduct(productFields);
      const productId = created.productId;
      const barcode = created.barcode;

      if (!productId) {
        showToast("Product created but no ID returned", "error");
        return;
      }

      let stockAdded = false;
      if (quantity && Number(quantity) > 0) {
        try {
          await addProducedStock(productId, Number(quantity));
          stockAdded = true;
        } catch (stockErr) {
          console.error("Stock addition failed:", stockErr);
          showToast("Product created but stock addition failed", "error");
        }
      }

      showToast(
        stockAdded ? `Product added with ${quantity} units in stock` : "Product added",
        "success"
      );
      setIsFormOpen(false);

      setNewlyAddedProduct({
        ...productFields,
        productId,
        barcode: barcode || "Barcode not generated",
        quantity: Number(quantity) || 0,
        stockAdded,
      });
      setPrintQty(1);
      setShowBarcodeModal(true);

      await fetchProducts();
      await fetchFactoryInventory();
    } catch (err) {
      console.error("Error in form submission:", err);
      const errorMessage = err?.Message || err?.message || "Something went wrong";
      showToast(errorMessage, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deletingProduct.productId);
      showToast("Product deleted", "success");
      await fetchProducts();
      await fetchFactoryInventory();
    } catch (err) {
      showToast(err || "Failed to delete product", "error");
    }
    setDeletingProduct(null);
  };

  const handlePrintExistingProduct = (product) => {
    setSelectedProductForPrint({ ...product, barcode: product.barcode || "N/A" });
    setPrintQty(1);
    setShowBarcodeModal(true);
  };

  const handlePrint = () => {
    if (!printRef.current) {
      showToast("No barcode to print", "error");
      return;
    }

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      showToast("Please allow popups for this site", "error");
      return;
    }

    const productName = selectedProductForPrint?.productName || newlyAddedProduct?.productName || "Product";

    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode - ${productName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { padding: 20px; font-family: 'Courier New', monospace; background: white; }
            .barcode-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 10px; max-width: 1200px; margin: 0 auto; }
            .barcode-item { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; border: 1px dashed #ccc; border-radius: 4px; background: white; page-break-inside: avoid; break-inside: avoid; min-height: 120px; }
            @media print { body { padding: 10px; } .barcode-item { border: 1px dashed #999; page-break-inside: avoid; break-inside: avoid; min-height: 100px; } }
            @media (max-width: 800px) { .barcode-container { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 500px) { .barcode-container { grid-template-columns: 1fr; } }
            @page { margin: 0.5cm; size: A4; }
          </style>
        </head>
        <body>
          <div class="barcode-container">${printContents}</div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 1000); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const categoryOptions = categories.map((c) => c.categoryName).filter(Boolean);

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
    { key: "barcode", label: "Barcode", render: (row) => <span className="text-brand-900 font-mono text-sm">{row.barcode || "—"}</span> },
    { key: "productName", label: "Product name", render: (row) => <span className="text-brand-900 font-medium">{row.productName}</span> },
    { key: "category", label: "Category", render: (row) => <span className="text-brand-900">{getCategoryName(row)}</span> },
    { key: "brand", label: "Brand", render: (row) => <span className="text-brand-900">{getBrandName(row)}</span> },
    { key: "size", label: "Size", render: (row) => <span className="text-brand-900">{row.size || "—"}</span> },
    {
      key: "mrp", label: "MRP", align: "right",
      render: (row) => <span className="text-brand-900 font-medium">₹{getFormattedPrice(row.mrp).toFixed(2)}</span>,
    },
    {
      key: "status", label: "Status",
      render: (row) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          row.status === "Active" ? "bg-emerald-50 text-emerald-600" :
          row.status === "LowStock" ? "bg-yellow-50 text-yellow-600" :
          "bg-red-50 text-red-600"
        }`}>
          {row.status || "Active"}
        </span>
      ),
    },
    {
      key: "action", label: "Actions", align: "center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => openEditForm(row)} className="text-brand-600 text-xs font-semibold hover:underline px-2 py-1">Edit</button>
          <button onClick={() => handlePrintExistingProduct(row)} className="text-blue-600 text-xs font-semibold hover:underline px-2 py-1" title="Print Barcode">🖨️</button>
          <button onClick={() => setDeletingProduct(row)} className="text-red-500 text-xs font-semibold hover:underline px-2 py-1">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Shirt className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-page-title">Products</p>
            <p className="text-page-subtitle">Manage and track all your store inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/categories")} className="border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors">Categories</button>
          <button onClick={() => navigate("/brands")} className="border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors">Brands</button>
          <button onClick={openAddForm} className="bg-brand-600 hover:bg-brand-800 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors">+ Add product</button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard label="Total products" value={products.length} icon="📦" />
          <StatCard label="Active" value={products.filter((p) => p.status === "Active").length} icon="✅" />
          <StatCard label="Low/out of stock" value={lowStockCount} icon="⚠️" />
          <StatCard label="Total MRP value" value={`₹${totalStockValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="💰" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact person, email, or phone..."
              className="w-full bg-white border border-brand-100 rounded-lg pl-11 pr-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="bg-white border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 flex items-center gap-2 hover:bg-brand-50"
          >
            <FilterIcon className="w-4 h-4" /> Filters
          </button>
          <button
            onClick={() => setPage(1)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-brand-100 rounded-lg p-5 mb-3">
            <div className="flex flex-wrap gap-6">
              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Product Name</label>
                <input
                  type="text"
                  value={productNameFilter}
                  onChange={(e) => { setProductNameFilter(e.target.value); setPage(1); }}
                  placeholder="Enter product name"
                  className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Category</label>
                <MultiSelect
                  label=""
                  options={categoryOptions}
                  values={selectedCategories}
                  onChange={(vals) => { setSelectedCategories(vals); setPage(1); }}
                  placeholder="Select Categories"
                />
              </div>

              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Date Range</label>
                <DateRangePicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onChange={(range) => { setDateRange(range); setPage(1); }}
                />
              </div>
            </div>

            {(productNameFilter || selectedCategories.length > 0 || dateRange.start) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-brand-100">
                {productNameFilter && (
                  <Chip label={`Name: ${productNameFilter}`} onRemove={() => setProductNameFilter("")} />
                )}
                {selectedCategories.map((c) => (
                  <Chip key={c} label={c} onRemove={() => setSelectedCategories((prev) => prev.filter((v) => v !== c))} />
                ))}
                {dateRange.start && (
                  <Chip
                    label={`${dateRange.start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}${dateRange.end ? ` – ${dateRange.end.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : ""}`}
                    onRemove={() => setDateRange({ start: null, end: null })}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <Card>
          <Table columns={columns} data={paginated} isLoading={isLoading} emptyMessage="No products found" />
          {!isLoading && filtered.length > 0 && (
            <div className="flex justify-end mt-3">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingProduct ? "Edit product" : "Add product"}>
        <ProductForm initialData={editingProduct} categories={categories} brands={brands} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal
        isOpen={showBarcodeModal}
        onClose={() => { setShowBarcodeModal(false); setNewlyAddedProduct(null); setSelectedProductForPrint(null); }}
        title="Product Added Successfully"
        size="lg"
      >
        {(newlyAddedProduct || selectedProductForPrint) && (
          <>
            <div className="mb-6">
              <div className={`border rounded-lg p-4 mb-4 ${newlyAddedProduct?.stockAdded ? "bg-emerald-50 border-emerald-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="text-sm"><span className="font-semibold">Product:</span> {(newlyAddedProduct || selectedProductForPrint)?.productName}</p>
                <p className="text-sm"><span className="font-semibold">Barcode:</span> {(newlyAddedProduct || selectedProductForPrint)?.barcode}</p>
                {newlyAddedProduct && (
                  <div className="mt-2 pt-2 border-t border-emerald-200">
                    {newlyAddedProduct.quantity > 0 ? (
                      <p className="text-sm font-semibold text-emerald-700">✅ Stock Added: {newlyAddedProduct.quantity} units</p>
                    ) : (
                      <p className="text-sm text-yellow-700">⚠️ No stock added</p>
                    )}
                  </div>
                )}
              </div>

              <label className="block text-sm font-medium text-brand-700 mb-2">Number of stickers to print:</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="1" max="100" value={printQty}
                  onChange={(e) => { const val = parseInt(e.target.value); setPrintQty(isNaN(val) || val < 1 ? 1 : Math.min(val, 100)); }}
                  className="w-24 px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <span className="text-sm text-brand-500">stickers</span>
                <button onClick={() => setPrintQty(1)} className="text-xs text-brand-500 hover:text-brand-700 underline">Reset</button>
              </div>
            </div>

            <div className="mb-4 p-4 border border-brand-200 rounded-lg bg-brand-50 max-h-60 overflow-y-auto">
              <p className="text-xs text-brand-400 mb-2">Preview:</p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: Math.min(printQty, 8) }).map((_, index) => {
                  const product = newlyAddedProduct || selectedProductForPrint;
                  return (
                    <div key={index} className="border border-gray-200 rounded p-2 bg-white flex flex-col items-center">
                      <BarcodeLabel product={{ name: product?.productName, barcode: product?.barcode }} showPrice={false} />
                    </div>
                  );
                })}
                {printQty > 8 && <div className="flex items-center text-brand-500 text-sm col-span-full justify-center">+{printQty - 8} more</div>}
              </div>
            </div>

            <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "100%", pointerEvents: "none", opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                {Array.from({ length: printQty }).map((_, index) => {
                  const product = newlyAddedProduct || selectedProductForPrint;
                  return (
                    <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 8px", border: "1px dashed #ccc", borderRadius: "4px", background: "white", minHeight: "120px" }}>
                      <BarcodeLabel product={{ name: product?.productName, barcode: product?.barcode }} showPrice={false} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end mt-5 gap-3 border-t border-brand-100 pt-4">
              <button className="px-4 py-2 border border-brand-200 rounded hover:bg-brand-50 transition-colors text-brand-700" onClick={() => { setShowBarcodeModal(false); setNewlyAddedProduct(null); setSelectedProductForPrint(null); }}>Close</button>
              {newlyAddedProduct && (
                <button onClick={() => { setShowBarcodeModal(false); setNewlyAddedProduct(null); navigate("/stock-transfer"); }} className="px-4 py-2 border border-brand-200 rounded hover:bg-brand-50 transition-colors text-brand-700">Go to Stock Transfer →</button>
              )}
              <button className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded transition-colors font-medium flex items-center gap-2" onClick={handlePrint}><span>🖨️</span> Print Stickers</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete product?"
        message={`Are you sure you want to delete "${deletingProduct?.productName}"? This can't be undone.`}
      />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-brand-100 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-stat-label mb-2 normal-case tracking-normal text-xs">{label}</p>
        <p className="text-stat-value text-2xl">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-brand-200 flex items-center justify-center text-lg">{icon}</div>
    </div>
  );
}