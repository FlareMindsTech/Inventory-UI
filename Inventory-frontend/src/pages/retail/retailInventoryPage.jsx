import { useEffect, useState, useRef } from "react";
import { Store, RefreshCw, SearchCheck } from "lucide-react";
import { useRetail } from "../../hook/useRetail";
import { useProducts } from "../../hook/useproduct";
import { useFactoryInventory } from "../../hook/useFactoryInventory";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";

export default function RetailInventory() {
  const { retailProducts, isLoading, fetchRetailInventory, adjustStock } = useRetail();
  const { fetchProducts } = useProducts();
  const { fetchFactoryInventory } = useFactoryInventory();
  const { showToast } = useToast();
const PAGE_SIZE = 10;
const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const alertedRef = useRef(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRetailInventory();
        await fetchProducts();
        await fetchFactoryInventory();
      } catch (err) {
       


      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (retailProducts && retailProducts.length > 0) {
      checkLowStockAlert();
    }
  }, [retailProducts]);

  const checkLowStockAlert = () => {
    if (!retailProducts || retailProducts.length === 0) return;

    const lowStockItems = retailProducts.filter(
      (p) => (p.quantity || 0) < (p.minimumStock || 5) && (p.quantity || 0) > 0
    );
    const outOfStockItems = retailProducts.filter((p) => (p.quantity || 0) === 0);

    const currentAlertKey = [...lowStockItems, ...outOfStockItems]
      .map((p) => p.product?.id)
      .sort()
      .join(",");

    if (alertedRef.current.has(currentAlertKey) || currentAlertKey === "") return;
    alertedRef.current.add(currentAlertKey);

    if (lowStockItems.length > 0) {
      const productNames = lowStockItems.map((p) => p.product?.productName).join(", ");
      showToast(`⚠️ Low Stock: ${lowStockItems.length} product(s) below minimum: ${productNames}`, "error");
    }
    if (outOfStockItems.length > 0) {
      const productNames = outOfStockItems.map((p) => p.product?.productName).join(", ");
      showToast(`❌ Out of Stock: ${outOfStockItems.length} product(s): ${productNames}`, "error");
    }
  };

  const handleCheckStock = () => {
    alertedRef.current.clear(); // force re-alert even if unchanged
    checkLowStockAlert();
    showToast("Stock check completed", "success");
  };

  const handleAddOne = async (row) => {
   console.log("Clicked Row:", row);
  console.log("Product:", row.product);


  console.log("Product ID:", productId);

const productId =
  row.product?.id ||
  row.product?.productId ||
  row.product?._id;


    if (!productId || updatingId) return;
    setUpdatingId(productId);
    const newQuantity = (row.quantity || 0) + 1;
    try {
      await adjustStock(productId, newQuantity, "Manual addition (+1)");
      showToast("✅ Stock increased by 1 unit", "success");
      await fetchRetailInventory();
    } catch (err) {
      showToast("❌ " + (err || "Failed to add stock"), "error");
    }
    setUpdatingId(null);
  };

  const handleSubtractOne = async (row) => {
    const currentStock = row.quantity || 0;
    const productId = row.product?.id;
    if (!productId || updatingId) return;
    if (currentStock <= 0) {
      showToast("Stock cannot go below 0", "error");
      return;
    }
    if (!confirm("Are you sure you want to subtract 1 unit from stock?")) return;

    setUpdatingId(productId);
    const newQuantity = currentStock - 1;
    try {
      await adjustStock(productId, newQuantity, "Manual subtraction (-1)");
      showToast("✅ Stock decreased by 1 unit", "success");
      await fetchRetailInventory();
    } catch (err) {
      showToast(err || "Failed to subtract stock", "error");
    }
    setUpdatingId(null);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 5) return "Low Stock";
    if (stock < 10) return "Medium Stock";
    return "In Stock";
  };

  const getStatusColor = (stock) => {
    if (stock === 0) return "bg-red-50 text-red-500";
    if (stock < 5) return "bg-orange-50 text-orange-500";
    if (stock < 10) return "bg-yellow-50 text-yellow-600";
    return "bg-emerald-50 text-emerald-600";
  };

  const lowStockCount =
    retailProducts?.filter((p) => (p.quantity || 0) < (p.minimumStock || 5) && (p.quantity || 0) > 0).length || 0;
  const outOfStockCount = retailProducts?.filter((p) => (p.quantity || 0) === 0).length || 0;

  const totalPages = Math.max(
  1,
  Math.ceil((retailProducts?.length || 0) / PAGE_SIZE)
);

const paginatedRetailProducts = (retailProducts || []).slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);
  const columns = [
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-400">📦</div>
          <div>
            <p className="font-medium text-brand-900">{row.product?.productName || "Unknown"}</p>
            <p className="text-xs text-brand-400">{row.product?.size} · {row.product?.color}</p>
          </div>
        </div>
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      render: (row) => <span className="font-mono text-sm text-brand-600">{row.product?.barcode || "—"}</span>,
    },
    {
      key: "stock",
      label: "Available Stock",
      align: "center",
      render: (row) => {
        const stock = row.quantity || 0;
        const minStock = row.minimumStock || 5;
        const isLow = stock < minStock && stock > 0;
        const isOut = stock === 0;
        return (
          <div>
            <span className={`font-semibold text-lg ${isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-emerald-600"}`}>
              {stock}
            </span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(stock)}`}>
              {getStockStatus(stock)}
            </span>
            {isLow && <span className="ml-2 text-xs text-orange-500">(Min: {minStock})</span>}
          </div>
        );
      },
    },
    {
      key: "minimumStock",
      label: "Min Stock",
      align: "center",
      render: (row) => <span className="text-sm text-brand-500">{row.minimumStock || 5}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (row) => {
        const stock = row.quantity || 0;
        const isUpdating = updatingId === row.product?.id;
        return (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handleSubtractOne(row)}
              disabled={stock <= 0 || isUpdating}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                stock > 0 && !isUpdating ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title="Subtract 1 unit"
            >
              ➖
            </button>
            <span className="text-sm font-bold text-brand-900 min-w-[30px] text-center">{stock}</span>
            <button
              onClick={() => handleAddOne(row)}
              disabled={isUpdating}
              className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
              title="Add 1 unit"
            >
              ➕
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-brand-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-page-title">Retail Shop Inventory</p>
            <p className="text-page-subtitle">Manage and track retail store stock</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchRetailInventory()}
            className="flex items-center gap-2 border border-brand-100 rounded-lg px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleCheckStock}
            className="flex items-center gap-2 border border-yellow-400 rounded-lg px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 transition-colors"
          >
            <SearchCheck className="w-4 h-4" />
            Check Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Products" value={retailProducts?.length || 0} icon="📦" color="blue" />
        <StatCard
          label="Total Stock"
          value={retailProducts?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0}
          icon="📊"
          color="green"
        />
        <StatCard label="Low Stock Items" value={lowStockCount} icon="⚠️" color="yellow" alert={lowStockCount > 0} />
        <StatCard label="Out of Stock" value={outOfStockCount} icon="❌" color="red" alert={outOfStockCount > 0} />
      </div>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            🚨 Stock Alert:
            {lowStockCount > 0 && ` ${lowStockCount} product(s) below minimum stock level.`}
            {outOfStockCount > 0 && ` ${outOfStockCount} product(s) out of stock.`}
            <span className="block text-xs text-red-500 mt-1">Please restock these items immediately.</span>
          </p>
        </div>
      )}

      <Card borderColor="border-brand-400">
        <Table columns={columns}  columns={columns}
  data={paginatedRetailProducts}
  isLoading={isLoading}
  emptyMessage="No retail stock available" borderColor="border-brand-400" />
  {!isLoading && retailProducts?.length > 0 && (
  <div className="flex justify-end mt-4">
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </div>
)}
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, color, alert = false }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className={`bg-white border ${alert ? "border-red-300 ring-2 ring-red-200" : "border-brand-100"} rounded-xl p-4 flex items-center justify-between transition-all`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-400 mb-2">{label}</p>
        <p className={`text-2xl font-bold ${alert ? "text-red-600" : "text-brand-900"}`}>{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl ${colors[color]} flex items-center justify-center text-xl`}>{icon}</div>
    </div>
  );
}