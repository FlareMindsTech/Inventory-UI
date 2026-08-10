import { useEffect, useState, useMemo } from "react";
import { Search, Filter as FilterIcon, Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";
import Card from "../../components/card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Chip from "../../components/Chip";
import MultiSelect from "../../components/MultiSelect";
import { useCustomer } from "../../hook/useCustomer";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/pagination";

const paymentIcons = {
  cash: <Banknote className="w-3.5 h-3.5 text-emerald-600" />,
  card: <CreditCard className="w-3.5 h-3.5 text-blue-600" />,
  upi: <Smartphone className="w-3.5 h-3.5 text-purple-600" />,
};

function PaymentMethodBadge({ method }) {
  const key = method?.toLowerCase();
  const icon = paymentIcons[key] || <Wallet className="w-3.5 h-3.5 text-brand-400" />;
  return (
    <span className="inline-flex items-center gap-1.5 capitalize">
      {icon}
      {method || "—"}
    </span>
  );
}

export default function CustomerPage() {
  const {
    customers,
    customer,
    purchaseHistory,
    isLoading,
    fetchCustomers,
    fetchCustomer,
    updateCustomer,
    deleteCustomer,
    fetchPurchaseHistory,
  } = useCustomer();

  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const PAGE_SIZE = 10;
const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchCustomers();
      } catch (err) {
        showToast(err, "error");
      }
    };
    load();
  }, []);

  const nameOptions = useMemo(
    () => [...new Set(customers.map((c) => c.customerName).filter(Boolean))],
    [customers]
  );

  const phoneOptions = useMemo(
    () => [...new Set(customers.map((c) => c.mobile).filter(Boolean))],
    [customers]
  );

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search);

    const matchesName =
      selectedNames.length === 0 || selectedNames.includes(c.customerName);
    const matchesPhone =
      selectedPhones.length === 0 || selectedPhones.includes(c.mobile);

    return matchesSearch && matchesName && matchesPhone;
  });

  const handleViewCustomer = async (customerId) => {
    try {
      await fetchCustomer(customerId);
      await fetchPurchaseHistory(customerId);
      setShowPurchaseModal(true);
    } catch (err) {
      showToast(err, "error");
    }
  };
  const totalPages = Math.max(
  1,
  Math.ceil(filteredCustomers.length / PAGE_SIZE)
);

const paginatedCustomers = filteredCustomers.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);

  const customerColumns = [
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
      key: "customerName",
      label: "Customer",
    },
    {
      key: "mobile",
      label: "Mobile",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
          {row.status}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button
          className="text-brand-600 hover:underline"
          onClick={() => handleViewCustomer(row.customerId)}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Search + Filters row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
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

      {/* Filter panel — Customer Name and Phone as multi-select */}
      {showFilters && (
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <div className="flex flex-wrap gap-6">
            <div className="flex-shrink-0" style={{ width: "220px" }}>
              <label className="block text-sm font-medium text-brand-900 mb-2">Customer Name</label>
              <MultiSelect
                label=""
                options={nameOptions}
                values={selectedNames}
                onChange={setSelectedNames}
                placeholder="Select Customers"
              />
            </div>

            <div className="flex-shrink-0" style={{ width: "220px" }}>
              <label className="block text-sm font-medium text-brand-900 mb-2">Phone Number</label>
              <MultiSelect
                label=""
                options={phoneOptions}
                values={selectedPhones}
                onChange={setSelectedPhones}
                placeholder="Select Phone Numbers"
              />
            </div>
          </div>

          {(selectedNames.length > 0 || selectedPhones.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-brand-100">
              {selectedNames.map((n) => (
                <Chip key={n} label={n} onRemove={() => setSelectedNames((prev) => prev.filter((v) => v !== n))} />
              ))}
              {selectedPhones.map((p) => (
                <Chip key={p} label={p} onRemove={() => setSelectedPhones((prev) => prev.filter((v) => v !== p))} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customers List Table */}
   <Card>
  <h2 className="text-lg font-semibold mb-4">Customers</h2>

  <Table
    columns={customerColumns}
    data={paginatedCustomers}
    isLoading={isLoading}
    emptyMessage="No customers found"
  />

  {!isLoading && filteredCustomers.length > 0 && (
    <div className="flex justify-end mt-4">
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )}
</Card>

      {/* Customer Details + Purchase History Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title={customer ? `Customer Details — ${customer.customerName}` : "Customer Details"}
        size="lg"
      >
        {customer && (
          <div className="mb-6 border border-brand-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-100">
                  <th className="text-left px-4 py-2.5 font-semibold text-brand-900">Name</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-brand-900">Mobile</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-brand-900">Email</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-brand-900">Address</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-brand-900">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2.5 text-brand-900">{customer.customerName}</td>
                  <td className="px-4 py-2.5 text-brand-900">{customer.mobile}</td>
                  <td className="px-4 py-2.5 text-brand-900">{customer.email || "—"}</td>
                  <td className="px-4 py-2.5 text-brand-900">{customer.address || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      {customer.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <h3 className="text-sm font-semibold text-brand-900 mb-3">Purchase History</h3>
        <Table
          columns={[
            {
              key: "billNumber",
              label: "Bill No",
              render: (row) => (
                <span className="font-medium">
                  {row.invoiceNumber}
                </span>
              ),
            },
            {
              key: "billDate",
              label: "Date",
              render: (row) => (
                <span>
                  {new Date(row.date ?? row.createdAt).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "payment",
              label: "Payment method",
              align: "center",
              render: (row) => <PaymentMethodBadge method={row.paymentMethod} />,
            },
            {
              key: "amount",
              label: "Amount",
              align: "right",
              render: (row) => (
                <span className="font-medium">
                  ₹{row.amount}
                </span>
              ),
            },
          ]}
          data={purchaseHistory}
          isLoading={isLoading}
          emptyMessage="No purchase history found"
        />
      </Modal>
    </div>
  );
}