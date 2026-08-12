import { useState, useEffect } from "react";
import { useProducts } from "../../hook/useproduct";
import { useStockTransfer } from "../../hook/useStockTransfer";
import { useFactoryInventory } from "../../hook/useFactoryInventory";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Button from "../../components/Button";

export default function StockTransfer() {
  const { products, fetchProducts } = useProducts();
  const { inventory, fetchFactoryInventory } = useFactoryInventory();
  const { transferToRetail, transferToOnline, isLoading } = useStockTransfer();
  const { showToast } = useToast();

  const [outlet, setOutlet] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchFactoryInventory();
  
  }, []);


  
  const getProductId = (p) => p.productId ?? p.id;

 const getQuantity = (productId) => {
  const record = inventory.find(
    (inv) => inv.product?.id === productId
  );

  return record?.quantity ?? 0;
};

  const toggleProduct = (product) => {
    const id = getProductId(product);
    const exists = selectedProducts.find((p) => getProductId(p) === id);
    if (exists) {
      setSelectedProducts((prev) => prev.filter((p) => getProductId(p) !== id));
    } else {
      setSelectedProducts((prev) => [...prev, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((item) => (getProductId(item) === id ? { ...item, qty: Number(qty) } : item))
    );
  };

  const handleTransfer = async () => {
    if (!outlet) {
      showToast("Please select an outlet", "error");
      return;
    }
    if (selectedProducts.length === 0) {
      showToast("Please select at least one product", "error");
      return;
    }

    const invalidQty = selectedProducts.some((item) => {
      const available = getQuantity(getProductId(item));
      return item.qty <= 0 || item.qty > available;
    });
    if (invalidQty) {
      showToast("Transfer quantity exceeds available factory stock", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const item of selectedProducts) {
        const id = getProductId(item);
        if (outlet === "Retail Shop") {
          await transferToRetail(id, item.qty);
        } else if (outlet === "Online Store") {
          await transferToOnline(id, item.qty);
        }
      }
      showToast("Stock transferred successfully", "success");
      setSelectedProducts([]);
      setOutlet("");
      await fetchFactoryInventory();
      await fetchProducts();
    } catch (err) {
      console.error("Transfer error:", err);
      const errorMsg = typeof err === 'string' ? err : err?.message || "Transfer failed";
      showToast(errorMsg, "error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-brand-50 min-h-screen">
      <Card title="Stock Transfer">
        <div className="mb-6">
          <label className="block text-sm font-medium text-brand-900 mb-2">Outlet</label>
          <select
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
            className="border border-brand-100 rounded-lg px-4 py-2 w-72 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Select Outlet</option>
            <option value="Retail Shop">Retail Shop</option>
            <option value="Online Store">Online Store</option>
          </select>
        </div>

        <div className="border border-brand-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50/60">
                <th className="py-3 px-3 w-10"></th>
                <th className="text-left py-3 px-3 text-table-header">Product</th>
                <th className="py-3 px-3 text-table-header">MRP</th>
                <th className="py-3 px-3 text-table-header">Available Qty</th>
                <th className="py-3 px-3 text-table-header">Transfer Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const id = getProductId(product);
                const available = getQuantity(id);
                const selected = selectedProducts.find((p) => getProductId(p) === id);

                return (
                  <tr key={id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/60">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        disabled={available === 0}
                        checked={!!selected}
                        onChange={() => toggleProduct(product)}
                        className="w-4 h-4 text-brand-600 rounded border-brand-300 focus:ring-brand-500"
                      />
                    </td>
                    <td className="py-3 px-3 text-brand-900 font-medium">{product.productName}</td>
                    <td className="py-3 px-3 text-center text-brand-900">₹{product.mrp}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        available === 0 ? "bg-red-50 text-red-500" : available < 10 ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {available}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {selected && (
                        <input
                          type="number"
                          min="1"
                          max={available}
                          value={selected.qty}
                          onChange={(e) => updateQty(id, e.target.value)}
                          className="border border-brand-100 rounded-lg w-20 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 px-3.5 py-2.5 bg-brand-200/60 border border-brand-200 rounded-lg">
            <p className="text-sm text-brand-800">
              <span className="font-semibold">{selectedProducts.length}</span> products selected for transfer to <span className="font-semibold">{outlet || "..."}</span>
            </p>
          </div>
        )}

        <Button
          onClick={handleTransfer}
          isLoading={isSubmitting || isLoading}
          size="sm"
          fullWidth={false}
          className="mt-6"
          disabled={selectedProducts.length === 0 || !outlet}
        >
          {isSubmitting ? "Transferring..." : "Transfer Stock"}
        </Button>
      </Card>
    </div>
  );
}