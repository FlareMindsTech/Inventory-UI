import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Repeat, PackageSearch } from "lucide-react";
import { useExchange } from "../../hook/useExchange";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Table from "../../components/Table";
import Button from "../../components/Button";

const settlementMethods = ["cash", "card", "upi", "store_credit"];

export default function ExchangePage() {
  const {
    invoice,
    invoiceItems,
    selectedOldProduct,
    productResults,
    selectedNewProduct,
    lastExchange,
    history,
    pagination,
    statusFilter,
    isLoading,
    error,
    findInvoice,
    searchProducts,
    pickOldProduct,
    pickNewProduct,
    clearProductResults,
    createExchange,
    loadExchangeHistory,
    changeStatusFilter,
    changePage,
    resetForm,
  } = useExchange();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [settlementMethod, setSettlementMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // load exchange history whenever the page's filters/page change
  useEffect(() => {
    loadExchangeHistory({ page: pagination.page, status: statusFilter }).then((res) => {
      console.log("EXCHANGE HISTORY RESULT:", res);
    }).catch((err) => {
      console.log("EXCHANGE HISTORY ERROR:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  // ----- price difference calculation -----
  const oldPrice =
    selectedOldProduct?.price ??
    selectedOldProduct?.productId?.mrp ??
    selectedOldProduct?.productId?.price ??
    0;
  const newPrice = selectedNewProduct?.mrp ?? selectedNewProduct?.price ?? 0;
  const priceDifference = (Number(newPrice) - Number(oldPrice)) * Number(quantity || 1);
  const needsSettlement = priceDifference !== 0;

  const handleFindInvoice = async () => {
    const number = invoiceNumber.trim();
    if (!number) {
      showToast("Enter an invoice number", "error");
      return;
    }
    try {
      const result = await findInvoice(number);
      console.log("INVOICE RESULT:", result);
    } catch (err) {
      console.log("INVOICE ERROR:", err);
      showToast(err || "Invoice not found", "error");
    }
  };

  const handleSearchProducts = async () => {
    const query = productQuery.trim();
    if (!query) {
      showToast("Enter a product name or barcode", "error");
      return;
    }
    try {
      await searchProducts(query);
    } catch (err) {
      showToast(err || "Search failed", "error");
    }
  };

  const handleSelectOldProduct = (item) => {
    pickOldProduct(item);
    clearProductResults();
    setProductQuery("");
  };

  const handleSelectNewProduct = (product) => {
    pickNewProduct(product);
  };

  const handleConfirmExchange = async () => {
    const oldProductId =
      selectedOldProduct?.productId?._id ??
      selectedOldProduct?.productId ??
      selectedOldProduct?._id;
    const newProductId = selectedNewProduct?._id ?? selectedNewProduct?.productId;

    if (!invoice || !oldProductId || !newProductId) {
      showToast("Select both the old and new product before confirming", "error");
      return;
    }

    if (needsSettlement && !settlementMethod) {
      showToast("Select a settlement method for the price difference", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExchange({
        invoiceNumber: invoice.invoiceNumber ?? invoiceNumber.trim(),
        oldProductId,
        newProductId,
        quantity: Number(quantity),
        ...(needsSettlement ? { settlementMethod } : {}),
      });
      showToast("Exchange completed", "success");
      resetForm();
      setInvoiceNumber("");
      setQuantity(1);
      setSettlementMethod("");
      loadExchangeHistory({ page: 1, status: statusFilter });
    } catch (err) {
      showToast(err || "Exchange failed", "error");
    }
    setIsSubmitting(false);
  };

  const invoiceItemColumns = [
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div>
          <p className="text-brand-900 font-medium">
            {row.productId?.productName ?? row.productName}
          </p>
          <p className="text-xs text-brand-400">{row.productId?.barcode ?? row.barcode}</p>
        </div>
      ),
    },
    { key: "qty", label: "Qty", align: "center", render: (row) => row.quantity },
    { key: "price", label: "Price", align: "right", render: (row) => `₹${row.price}` },
    {
      key: "action",
      label: "",
      align: "right",
      render: (row) => (
        <button
          onClick={() => handleSelectOldProduct(row)}
          className="text-brand-600 text-xs font-semibold hover:underline"
        >
          Select
        </button>
      ),
    },
  ];

  const productResultColumns = [
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div>
          <p className="text-brand-900 font-medium">{row.productName}</p>
          <p className="text-xs text-brand-400">{row.barcode}</p>
        </div>
      ),
    },
    { key: "price", label: "Price", align: "right", render: (row) => `₹${row.mrp ?? row.price}` },
    { key: "stock", label: "Stock", align: "center", render: (row) => row.stockStatus ?? "-" },
    {
      key: "action",
      label: "",
      align: "right",
      render: (row) => (
        <button
          onClick={() => handleSelectNewProduct(row)}
          className="text-brand-600 text-xs font-semibold hover:underline"
        >
          Select
        </button>
      ),
    },
  ];

  const historyColumns = [
    { key: "ref", label: "Ref #", render: (row) => row.returnId },
    { key: "invoice", label: "Invoice #", render: (row) => row.invoiceNumber },
    { key: "product", label: "Product", render: (row) => row.productName },
    { key: "qty", label: "Qty", align: "center", render: (row) => row.quantity },
    {
      key: "settlement",
      label: "Refund",
      align: "right",
      render: (row) => (row.refundAmount ? `₹${row.refundAmount}` : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
          {row.status}
        </span>
      ),
    },
    { key: "date", label: "Date", render: (row) => row.date ?? "-" },
    {
      key: "action",
      label: "",
      align: "right",
      render: (row) => (
        <button
          onClick={() => navigate(`/invoices/${row.invoiceNumber}`)}
          className="text-brand-600 text-xs font-semibold hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-brand-50 p-6">
      <div className="mb-5">
        <p className="text-xl font-bold text-brand-900">Exchange Product</p>
        <p className="text-sm text-brand-400">Look up an invoice, swap a product, and settle the difference.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-4">
          {/* Step 1: find invoice */}
          <Card title="Find invoice">
            <div className="flex gap-2">
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindInvoice()}
                placeholder="INV-20260807-0001"
                className="flex-1 border border-brand-100 rounded-lg px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button onClick={handleFindInvoice} isLoading={isLoading}>
                <Search size={14} className="mr-1" />
                Find
              </Button>
            </div>

            {invoice && (
              <div className="mt-4">
                <p className="text-xs text-brand-400 mb-2">
                  Select the product the customer wants to return:
                </p>
                <Table
                  columns={invoiceItemColumns}
                  data={invoiceItems}
                  emptyMessage="No items found on this invoice"
                />
              </div>
            )}
          </Card>

          {/* Step 2: pick the old product's replacement */}
          {selectedOldProduct && (
            <Card title="Pick replacement product">
              <div className="mb-3 flex items-center gap-2 text-sm text-brand-600">
                <Repeat size={14} />
                <span>
                  Returning:{" "}
                  <span className="font-medium text-brand-900">
                    {selectedOldProduct.productId?.productName ?? selectedOldProduct.productName}
                  </span>
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchProducts()}
                  placeholder="Search product name or barcode..."
                  className="flex-1 border border-brand-100 rounded-lg px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <Button onClick={handleSearchProducts} isLoading={isLoading}>
                  <PackageSearch size={14} className="mr-1" />
                  Search
                </Button>
              </div>

              {productResults.length > 0 && (
                <div className="mt-4">
                  <Table
                    columns={productResultColumns}
                    data={productResults}
                    emptyMessage="No products found"
                  />
                </div>
              )}

              {selectedNewProduct && (
                <div className="mt-4 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-700">
                  New product: <span className="font-medium">{selectedNewProduct.productName}</span>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Confirm panel */}
        <Card className="h-fit sticky top-6" title="Confirm exchange">
          {!selectedOldProduct || !selectedNewProduct ? (
            <p className="text-sm text-brand-400">
              Select an old product from the invoice and a replacement to continue.
            </p>
          ) : (
            <>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />

              {/* Price difference / sub amount display */}
              <div
                className={`mb-4 rounded-lg px-3 py-2.5 text-sm font-medium border ${
                  priceDifference > 0
                    ? "bg-red-50 text-red-700 border-red-100"
                    : priceDifference < 0
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-brand-50 text-brand-700 border-brand-100"
                }`}
              >
                <div className="flex justify-between text-xs text-brand-400 mb-1">
                  <span>Old: ₹{oldPrice}</span>
                  <span>New: ₹{newPrice}</span>
                </div>
                {priceDifference > 0 && `Customer pays ₹${priceDifference}`}
                {priceDifference < 0 && `Refund to customer ₹${Math.abs(priceDifference)}`}
                {priceDifference === 0 && "No price difference — no settlement needed"}
              </div>

              {needsSettlement && (
                <>
                  <label className="text-sm font-medium text-brand-900 block mb-1.5">
                    Settlement method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={settlementMethod}
                    onChange={(e) => setSettlementMethod(e.target.value)}
                    className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="">Select method</option>
                    {settlementMethods.map((m) => (
                      <option key={m} value={m}>
                        {m.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <Button onClick={handleConfirmExchange} isLoading={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm exchange"}
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Exchange history */}
      <Card className="mt-6" title="Exchange history">
        <div className="flex items-center justify-end mb-3">
          <select
            value={statusFilter}
            onChange={(e) => changeStatusFilter(e.target.value)}
            className="border border-brand-100 rounded-lg px-3 py-1.5 text-sm text-brand-900"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <Table columns={historyColumns} data={history} emptyMessage="No exchanges yet" />

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => changePage(pagination.page - 1)}
              className="px-3 py-1.5 text-sm border border-brand-100 rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-brand-400 self-center">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => changePage(pagination.page + 1)}
              className="px-3 py-1.5 text-sm border border-brand-100 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}