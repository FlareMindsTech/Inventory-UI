import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, RefreshCw, Search, Filter as FilterIcon } from "lucide-react";
import Card from "../../components/card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import MultiSelect from "../../components/MultiSelect";
import DateRangePicker from "../../components/DateRangerPicker";
import { useInvoice } from "../../hook/useInvoice";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/pagination";

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
const PAGE_SIZE = 10;
const [page, setPage] = useState(1);
  const {
    invoices,
    fetchInvoices,
    cancelInvoice,
    isLoading,
  } = useInvoice();

  const [search, setSearch] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      await fetchInvoices();
    } catch (err) {
      showToast(err, "error");
    }
  };

  const handleView = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleCancel = async (invoiceId) => {
    try {
      await cancelInvoice(invoiceId, "Customer cancelled");
      showToast("Invoice cancelled", "success");
      loadInvoices();
    } catch (err) {
      showToast(err, "error");
    }
  };

  const customerOptions = useMemo(
    () => [...new Set(invoices.map((inv) => inv.customerName).filter(Boolean))],
    [invoices]
  );

  const paymentMethodOptions = useMemo(
    () => [...new Set(invoices.map((inv) => inv.paymentMethod).filter(Boolean))],
    [invoices]
  );

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      !search || inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesCustomer =
      selectedCustomers.length === 0 || selectedCustomers.includes(inv.customerName);

    const matchesPaymentMethod =
      selectedPaymentMethods.length === 0 || selectedPaymentMethods.includes(inv.paymentMethod);

    let matchesDate = true;
    if (dateRange.start && inv.createdAt) {
      const invDate = new Date(inv.createdAt);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);
      end.setHours(23, 59, 59, 999);
      matchesDate = invDate >= start && invDate <= end;
    }

    return matchesSearch && matchesCustomer && matchesPaymentMethod && matchesDate;
  });

  const totalPages = Math.max(
  1,
  Math.ceil(filteredInvoices.length / PAGE_SIZE)
);

const paginatedInvoices = filteredInvoices.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);

  const columns = [
    {
  key: "serial",
  label: "S.No",
  render: (_, index) => (
    <span>
      {(page - 1) * PAGE_SIZE + index + 1}
    </span>
  ),
},
    {
      key: "invoiceNumber",
      label: "Invoice No",
    },
    {
      key: "customerName",
      label: "Customer",
      render: (row) => row.customerName,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      render: (row) => (
        <span className="capitalize">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: "grandTotal",
      label: "Grand Total",
      render: (row) => `₹${row.grandTotal?.toFixed(2)}`,
    },
    {
      key: "invoiceStatus",
      label: "Status",
      render: (row) => (
        <span className="capitalize font-semibold text-green-600">
          {row.invoiceStatus}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            fullWidth={false}
            onClick={() => handleView(row.invoiceId)}
          >
            View
          </Button>

          <Button
            size="sm"
            fullWidth={false}
            variant="danger"
            onClick={() => handleCancel(row.invoiceId)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-brand-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-page-title">Invoices</p>
            <p className="text-page-subtitle">View and manage all customer invoices</p>
          </div>
        </div>
        <Button size="sm" fullWidth={false} onClick={loadInvoices}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Search + Filters row — sits above the table, same as Product page */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or customer..."
            className="w-full bg-white border border-brand-100 rounded-lg pl-11 pr-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="bg-white border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 flex items-center gap-2 hover:bg-brand-50"
        >
          <FilterIcon className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filter panel — sits above the table, same as Product page */}
      {showFilters && (
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <div className="flex flex-wrap gap-6">
            <div className="flex-shrink-0" style={{ width: "220px" }}>
              <label className="block text-sm font-medium text-brand-900 mb-2">Customer Name</label>
              <MultiSelect
                label=""
                options={customerOptions}
                values={selectedCustomers}
                onChange={setSelectedCustomers}
                placeholder="Select Customers"
              />
            </div>

            <div className="flex-shrink-0" style={{ width: "220px" }}>
              <label className="block text-sm font-medium text-brand-900 mb-2">Payment Method</label>
              <MultiSelect
                label=""
                options={paymentMethodOptions}
                values={selectedPaymentMethods}
                onChange={setSelectedPaymentMethods}
                placeholder="Select Payment Methods"
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

          {(selectedCustomers.length > 0 || selectedPaymentMethods.length > 0 || dateRange.start) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-brand-100">
              {selectedCustomers.map((c) => (
                <Chip key={c} label={c} onRemove={() => setSelectedCustomers((prev) => prev.filter((v) => v !== c))} />
              ))}
              {selectedPaymentMethods.map((m) => (
                <Chip key={m} label={m} onRemove={() => setSelectedPaymentMethods((prev) => prev.filter((v) => v !== m))} />
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
  <Table
    columns={columns}
    data={paginatedInvoices}
    isLoading={isLoading}
    emptyMessage="No invoices found"
  />

  {!isLoading && filteredInvoices.length > 0 && (
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