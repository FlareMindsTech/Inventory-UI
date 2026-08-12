import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Repeat, PackageSearch, Filter as FilterIcon } from "lucide-react";
import { useExchange } from "../../hook/useExchange";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Pagination from "../../components/pagination";
import MultiSelect from "../../components/MultiSelect";
import DateRangePicker from "../../components/DateRangerPicker";
import Chip from "../../components/Chip";

const settlementMethods = ["cash", "card", "upi", "store_credit"];
const statusOptions = ["Approved", "Completed", "Rejected", "Exchanged"];

// Turns a raw Mongo ID like "6a7c1f6420133f8a5b8e52a8" into a short, readable
// reference like "REF-8E52A8" (last 6 chars, uppercased). The full ID is kept
// in the title attribute for anyone who needs to look it up exactly.
function formatRef(id) {
  if (!id) return "—";
  const tail = String(id).slice(-6).toUpperCase();
  return `REF-${tail}`;
}

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

  // ----- Exchange history filters, styled like ProductList: a top
  // search bar + Filters toggle + Search button, then a filter panel
  // where every dropdown filter is a MultiSelect (options built from
  // whatever's in the currently loaded history, same pattern as
  // ProductList's Category filter being built from `categories`). -----
  const [historySearch, setHistorySearch] = useState("");
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // statusFilter from the hook is treated as a comma-separated string so it
  // stays the single source of truth driving the useEffect below — the
  // MultiSelect just reads/writes it as an array view of that same string.
  const selectedStatuses = statusFilter ? statusFilter.split(",").filter(Boolean) : [];
  const handleStatusChange = (values) => {
    changeStatusFilter(values.join(","));
  };

  useEffect(() => {
    loadExchangeHistory({ page: pagination.page, status: statusFilter }).then((res) => {
     
    }).catch((err) => {
    
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

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
     
    } catch (err) {
      
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

  // Option lists for the MultiSelect filters, derived from whatever history
  // rows are currently loaded — same idea as ProductList building
  // `categoryOptions` off the `categories` list. These will only include
  // names/invoices seen on the loaded page(s), not the whole dataset.
  const nameOptions = useMemo(() => {
    const set = new Set();
    (history || []).forEach((row) => {
      if (row.productName) set.add(row.productName);
      const exchangedForName = row.exchangedForProduct?.productName ?? row.exchangedFor;
      if (exchangedForName) set.add(exchangedForName);
    });
    return Array.from(set).sort();
  }, [history]);

  const invoiceOptions = useMemo(() => {
    const set = new Set();
    (history || []).forEach((row) => {
      if (row.invoiceNumber) set.add(row.invoiceNumber);
    });
    return Array.from(set).sort();
  }, [history]);

  // Client-side filter: top search bar (matches product, exchanged-for
  // product, invoice number, or approver) + Product Name / Invoice Number
  // MultiSelects + date range. Status is applied server-side via
  // statusFilter (see useEffect above). All applied on top of whatever
  // history page is already loaded — see caveat on loadExchangeHistory below.
  const filteredHistory = useMemo(() => {
    let rows = history || [];

    const matchText = (row, q) => {
      const exchangedForName = row.exchangedForProduct?.productName ?? row.exchangedFor ?? "";
      return (
        row.productName?.toLowerCase().includes(q) ||
        exchangedForName.toLowerCase().includes(q) ||
        row.invoiceNumber?.toLowerCase().includes(q) ||
        row.approvedBy?.toLowerCase().includes(q)
      );
    };

    const topQuery = historySearch.trim().toLowerCase();
    if (topQuery) {
      rows = rows.filter((row) => matchText(row, topQuery));
    }

    if (selectedNames.length > 0) {
      rows = rows.filter((row) => {
        const exchangedForName = row.exchangedForProduct?.productName ?? row.exchangedFor;
        return selectedNames.includes(row.productName) || selectedNames.includes(exchangedForName);
      });
    }

    if (selectedInvoices.length > 0) {
      rows = rows.filter((row) => selectedInvoices.includes(row.invoiceNumber));
    }

    if (dateRange.start || dateRange.end) {
      rows = rows.filter((row) => {
        if (!row.date) return false;
        const rowDate = new Date(row.date);
        if (Number.isNaN(rowDate.getTime())) return false;
        if (dateRange.start && rowDate < dateRange.start) return false;
        if (dateRange.end && rowDate > dateRange.end) return false;
        return true;
      });
    }

    return rows;
  }, [history, historySearch, selectedNames, selectedInvoices, dateRange]);

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
          type="button"
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
          type="button"
          onClick={() => handleSelectNewProduct(row)}
          className="text-brand-600 text-xs font-semibold hover:underline"
        >
          Select
        </button>
      ),
    },
  ];

  const historyColumns = [
    {
      key: "ref",
      label: "Ref #",
      render: (row) => (
        <span className="font-mono text-xs text-brand-700" title={row.returnId}>
          {formatRef(row.returnId)}
        </span>
      ),
    },
    { key: "invoice", label: "Invoice #", render: (row) => row.invoiceNumber },
    {
      key: "product",
      label: "Product",
      render: (row) => {
        const exchangedForName = row.exchangedForProduct?.productName ?? row.exchangedFor;
        return (
          <div>
            <p className="text-brand-900 font-medium">{row.productName}</p>
            {exchangedForName && (
              <p className="text-xs text-brand-400">→ {exchangedForName}</p>
            )}
          </div>
        );
      },
    },
    { key: "qty", label: "Qty", align: "center", render: (row) => row.quantity },
    {
      key: "settlement",
      label: "Amount",
      align: "right",
      // refundAmount from the API is always 0 (backend bug) — priceDifference
      // is the field that's actually populated. It can be negative (refund
      // to customer) or positive (customer pays), so format the sign/label
      // instead of printing the raw signed number.
      render: (row) => {
        const diff = row.priceDifference;
        if (diff === undefined || diff === null || diff === 0) return "-";
        const isRefund = diff < 0 || row.exchangeAction === "Refund Customer";
        return (
          <span className={isRefund ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
            {isRefund ? "Refund " : "Pays "}₹{Math.abs(diff).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 whitespace-nowrap">
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
          type="button"
          onClick={() => navigate(`/invoices/${row.invoiceNumber}`)}
          className="text-brand-600 text-xs font-semibold hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  const hasActiveFilters = Boolean(
    selectedNames.length > 0 || selectedInvoices.length > 0 || selectedStatuses.length > 0 || dateRange.start
  );

  return (
    <div className="w-full min-h-screen bg-brand-50 p-6">
      <div className="mb-5">
        <p className="text-xl font-bold text-brand-900">Exchange Product</p>
        <p className="text-sm text-brand-400">Look up an invoice, swap a product, and settle the difference.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-4">
          <Card title="Find invoice">
            <div className="flex gap-2">
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindInvoice()}
                placeholder="INV-20260807-0001"
                className="flex-1 min-w-0 border border-brand-100 rounded-lg px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button
                onClick={handleFindInvoice}
                isLoading={isLoading}
                className="!w-auto shrink-0 px-5 whitespace-nowrap"
              >
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
                  className="flex-1 min-w-0 border border-brand-100 rounded-lg px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <Button
                  onClick={handleSearchProducts}
                  isLoading={isLoading}
                  className="!w-auto shrink-0 px-5 whitespace-nowrap"
                >
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
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search by product, invoice, or approver..."
              className="w-full bg-white border border-brand-100 rounded-lg pl-11 pr-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <button
            onClick={() => setShowHistoryFilters((prev) => !prev)}
            className="bg-white border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 flex items-center gap-2 hover:bg-brand-50"
          >
            <FilterIcon className="w-4 h-4" /> Filters
          </button>
          <button
            onClick={() => changePage(1)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {showHistoryFilters && (
          <div className="bg-white border border-brand-100 rounded-lg p-5 mb-3">
            <div className="flex flex-wrap gap-6">
              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Product Name</label>
                <MultiSelect
                  label=""
                  options={nameOptions}
                  values={selectedNames}
                  onChange={setSelectedNames}
                  placeholder="Select products"
                />
              </div>

              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Invoice Number</label>
                <MultiSelect
                  label=""
                  options={invoiceOptions}
                  values={selectedInvoices}
                  onChange={setSelectedInvoices}
                  placeholder="Select invoices"
                />
              </div>

              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Status</label>
                <MultiSelect
                  label=""
                  options={statusOptions}
                  values={selectedStatuses}
                  onChange={handleStatusChange}
                  placeholder="Select statuses"
                />
              </div>

              <div className="flex-shrink-0" style={{ width: "220px" }}>
                <label className="block text-sm font-medium text-brand-900 mb-2">Date Range</label>
                <DateRangePicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onChange={setDateRange}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-brand-100">
                {selectedNames.map((n) => (
                  <Chip
                    key={`name-${n}`}
                    label={n}
                    onRemove={() => setSelectedNames((prev) => prev.filter((v) => v !== n))}
                  />
                ))}
                {selectedInvoices.map((inv) => (
                  <Chip
                    key={`inv-${inv}`}
                    label={inv}
                    onRemove={() => setSelectedInvoices((prev) => prev.filter((v) => v !== inv))}
                  />
                ))}
                {selectedStatuses.map((s) => (
                  <Chip
                    key={`status-${s}`}
                    label={s}
                    onRemove={() => handleStatusChange(selectedStatuses.filter((v) => v !== s))}
                  />
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

        <p className="text-xs text-brand-400 mb-2">
          {filteredHistory.length} record{filteredHistory.length === 1 ? "" : "s"}
        </p>

        <Table columns={historyColumns} data={filteredHistory} emptyMessage="No exchanges yet" />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={changePage}
        />
      </Card>
    </div>
  );
}