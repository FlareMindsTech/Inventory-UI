import { useState, useRef, useEffect } from "react";
import { Search, UserPlus, ShoppingBag, ArrowRight, Phone, User, Receipt, Plus, X } from "lucide-react";
import { useBilling } from "../../hook/useBilling";
import { useToast } from "../../context/ToastContext";
import { createCustomer, getCustomerByPhone, getCustomerById } from "../../features/customers/customerApi";
import Card from "../../components/card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useInvoice } from "../../hook/useInvoice";


const paymentMethods = ["Cash", "Card", "UPI"];

export default function BillingPage() {
  const {
    scannedProduct, cartItems, generatedBill, customerId, currentBill,
    activeBillId, openBills,
    scanBarcode, addItemToBill, removeItem, updateItemQuantity,
    generateBill, processPayment, clearScanned, clearSession, setCustomer,
    startNewBill, loadOpenBills, discardBill, switchBill,
  } = useBilling();
  const navigate = useNavigate();
  const { generateInvoice } = useInvoice();
  const { showToast } = useToast();

  // Step 1: search by mobile
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customerNotFound, setCustomerNotFound] = useState(false);

  // Step 2 (only if not found): enter name to create
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const [customerAttached, setCustomerAttached] = useState(false);

  const [scanInput, setScanInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isPaying, setIsPaying] = useState(false);
  const inputRef = useRef(null);

  // the id of the bill this screen is currently working with — every add/generate/pay
  // call below passes this explicitly, since the backend refuses to guess when more
  // than one open bill exists.
  const billId = currentBill?.billId ?? currentBill?._id ?? currentBill?.id ?? null;
  useEffect(() => {
    console.log("CURRENT BILL:", currentBill, "RESOLVED billId:", billId);
  }, [currentBill]);

  useEffect(() => {
    console.log("Updated cart:", cartItems);
  }, [cartItems]);

  // restore the waiting queue on mount, in case bills are already open (e.g. page refresh)
  useEffect(() => {
    loadOpenBills().catch((err) => console.log("OPEN BILLS ERROR:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resolve each queued bill's customerId into a real name, once, and cache it.
  // customerId may already come populated as an object (with customerName) from the
  // backend — only fall back to a separate lookup when it's a bare string id.
  const [customerNameCache, setCustomerNameCache] = useState({});
  useEffect(() => {
    const idsToFetch = [
      ...new Set(
        openBills
          .map((b) => b.customerId)
          .filter((cid) => cid && typeof cid === "string" && !customerNameCache[cid])
      ),
    ];
    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(async (id) => {
      try {
        const res = await getCustomerById(id);
        const customer = res?.Result ?? res?.data ?? res;
        const name = customer?.customerName ?? customer?.name ?? null;
        if (name) {
          setCustomerNameCache((prev) => ({ ...prev, [id]: name }));
        }
      } catch (err) {
        console.log("CUSTOMER LOOKUP ERROR:", id, err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBills]);

  useEffect(() => {
    if (customerAttached) {
      inputRef.current?.focus();

      const refocus = (e) => {
        const tag = e.target.tagName;
        const isFormElement = ["SELECT", "INPUT", "TEXTAREA", "BUTTON", "OPTION"].includes(tag);
        if (!isFormElement) {
          inputRef.current?.focus();
        }
      };

      document.addEventListener("click", refocus);
      return () => document.removeEventListener("click", refocus);
    }
  }, [customerAttached]);

  // explicitly opens one fresh bill for this customer, so we get back a concrete
  // billId to pass on every subsequent call. Prevents the "multiple open bills" error.
  const beginBill = async (id) => {
    try {
      const bill = await startNewBill(id ?? null);
      console.log("START NEW BILL RESULT:", bill);
    } catch (err) {
      showToast(err || "Failed to start a new bill", "error");
    }
  };

  const handleSearchCustomer = async () => {
    const phone = searchPhone.trim();
    if (!phone) {
      showToast("Enter a mobile number", "error");
      return;
    }

    setIsSearching(true);
    try {
      const lookup = await getCustomerByPhone(phone);
      console.log("phone lookup raw:", lookup);
      const result = lookup?.Result ?? lookup?.data ?? lookup;

      if (result && (result.customerId || result._id || result.id)) {
        const id = result.customerId ?? result._id ?? result.id;
        setCustomer(id);
        setCustomerName(result.customerName ?? result.name ?? "");
        setCustomerPhone(phone);
        await beginBill(id);
        setCustomerAttached(true);
        showToast("Customer found", "success");
      } else {
        setCustomerPhone(phone);
        setCustomerNotFound(true);
      }
    } catch (err) {
      console.log("No existing customer for this phone:", err?.response?.status);
      setCustomerPhone(phone);
      setCustomerNotFound(true);
    }
    setIsSearching(false);
  };

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      showToast("Enter customer name", "error");
      return;
    }
    setIsSavingCustomer(true);
    try {
      const created = await createCustomer({
        customerName: customerName.trim(),
        mobile: customerPhone,
      });
      console.log("created:", created);

      const result = created.Result || created.data || created;
      const id = result.id ?? result._id ?? result.customerId;

      setCustomer(id);
      await beginBill(id);
      setCustomerAttached(true);
      showToast("New customer created", "success");
    } catch (err) {
      console.error("Customer Error:", err);
      showToast(
        err?.response?.data?.Message ||
        err?.message ||
        "Failed to add customer",
        "error"
      );
    }
    setIsSavingCustomer(false);
  };

  const handleBackToSearch = () => {
    setCustomerNotFound(false);
    setCustomerName("");
  };

  const handleSkipCustomer = async () => {
    await beginBill(null);
    setCustomerAttached(true);
  };

  const handleChangeCustomer = () => {
    clearSession();
    setCustomerAttached(false);
    setCustomerNotFound(false);
    setSearchPhone("");
    setCustomerName("");
    setCustomerPhone("");
  };

  // goes back to the search screen to bring in ANOTHER customer —
  // unlike "Change customer", this does NOT clear the current bill;
  // it just parks it in the queue so you can switch back later.
  const handleAddNewCustomer = () => {
    setCustomerAttached(false);
    setCustomerNotFound(false);
    setSearchPhone("");
    setCustomerName("");
    setCustomerPhone("");
  };

  const getBillIdOf = (bill) => bill?.billId ?? bill?._id ?? bill?.id;
  const getBillLabel = (bill) => {
    const cid = bill?.customerId;
    if (cid && typeof cid === "object") {
      return cid.customerName ?? cid.name ?? cid.mobile ?? "Customer";
    }
    if (cid && typeof cid === "string") {
      return customerNameCache[cid] ?? "Customer";
    }
    return "Walk-in";
  };

  const handleSwitchBill = (bill) => {
    const label = getBillLabel(bill);
    const cid = typeof bill?.customerId === "object" ? bill.customerId?._id : bill?.customerId;
    switchBill(getBillIdOf(bill));
    setCustomerName(label === "Walk-in" || label === "Customer" ? "" : label);
    setCustomerPhone(bill?.customerId?.mobile ?? bill?.customerPhone ?? "");
    setCustomer(cid ?? null);
    setCustomerAttached(true);
  };

  const handleDiscardBill = async (id) => {
    try {
      await discardBill(id);
      showToast("Bill discarded", "success");
      if (id === billId) {
        setCustomerAttached(false);
      }
    } catch (err) {
      showToast(err || "Failed to discard bill", "error");
    }
  };

  // removes every open bill that has nothing rung up yet (heuristic: zero subtotal/grandTotal) —
  // useful for clearing out test/accidental walk-in bills in bulk.
  const [isClearingEmpty, setIsClearingEmpty] = useState(false);
  const handleClearEmptyBills = async () => {
    const emptyBills = openBills.filter(
      (b) => !(b.subtotal > 0) && !(b.grandTotal > 0)
    );
    console.log("OPEN BILLS (full):", openBills);
    console.log("EMPTY BILLS TO DISCARD:", emptyBills.map((b) => ({ resolvedId: getBillIdOf(b), raw: b })));
    if (emptyBills.length === 0) {
      showToast("No empty bills to clear", "error");
      return;
    }
    setIsClearingEmpty(true);
    try {
      await Promise.all(emptyBills.map((b) => discardBill(getBillIdOf(b))));
      showToast(`Cleared ${emptyBills.length} empty bill(s)`, "success");
      if (emptyBills.some((b) => getBillIdOf(b) === billId)) {
        setCustomerAttached(false);
      }
    } catch (err) {
      showToast(err || "Failed to clear empty bills", "error");
    }
    setIsClearingEmpty(false);
  };

  const QueueStrip = () =>
    openBills.length === 0 ? null : (
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {openBills.map((bill) => {
          const id = getBillIdOf(bill);
          const isActive = id === billId;
          return (
            <div
              key={id}
              onClick={() => handleSwitchBill(bill)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap transition ${
                isActive
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-brand-600 border-brand-100 hover:bg-brand-50"
              }`}
            >
              <User size={12} />
              {getBillLabel(bill)}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDiscardBill(id);
                }}
                className={isActive ? "text-white/70 hover:text-white" : "text-brand-300 hover:text-red-500"}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        <button
          onClick={handleAddNewCustomer}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-brand-200 text-brand-500 hover:bg-brand-50 whitespace-nowrap"
        >
          <Plus size={12} />
          New customer
        </button>
        {openBills.length > 2 && (
          <button
            onClick={handleClearEmptyBills}
            disabled={isClearingEmpty}
            className="text-xs text-red-500 hover:underline whitespace-nowrap disabled:opacity-50"
          >
            {isClearingEmpty ? "Clearing..." : "Clear empty bills"}
          </button>
        )}
      </div>
    );

  const handleScan = async (e) => {
    if (e.key !== "Enter") return;
    const barcode = scanInput.trim();
    setScanInput("");
    console.log("SCAN:", barcode);
    if (!barcode) return;

    if (!billId) {
      showToast("No active bill yet — try changing customer and starting again", "error");
      return;
    }

    setIsScanning(true);
    try {
      const product = await scanBarcode(barcode);
      const result = await addItemToBill(product.productId, 1, customerId, billId);
      console.log("ADD ITEM RESULT:", result);
      showToast(`Added ${product.productName} to bill`, "success");
      clearScanned();
    } catch (err) {
      showToast(err || "Product not found", "error");
    }
    setIsScanning(false);
  };

  const handleQtyChange = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      await updateItemQuantity(itemId, qty);
    } catch (err) {
      showToast(err || "Failed to update quantity", "error");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      showToast("Item removed", "success");
    } catch (err) {
      showToast(err || "Failed to remove item", "error");
    }
  };

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }
    setIsGenerating(true);
    try {
      await generateBill(billId);
      showToast("Bill generated — select payment method to complete", "success");
    } catch (err) {
      showToast(err || "Failed to generate bill", "error");
    }
    setIsGenerating(false);
  };

  const handlePayment = async () => {
    const payBillId = generatedBill?.billId ?? billId;
    if (!payBillId) {
      showToast("No bill to pay for", "error");
      return;
    }
    setIsPaying(true);
    try {
      await processPayment(payBillId, paymentMethod);
      showToast("Payment completed successfully", "success");

      const invoice = await generateInvoice(payBillId);
      const invoiceId = invoice.invoiceId ?? invoice.id ?? invoice._id;

      const remaining = openBills.filter((b) => getBillIdOf(b) !== payBillId);

      clearSession();
      if (remaining.length > 0) {
        // another customer is still waiting — drop back to the queue instead of the search screen
        setCustomerAttached(false);
      } else {
        setCustomerAttached(false);
        setCustomerNotFound(false);
        setSearchPhone("");
        setCustomerName("");
        setCustomerPhone("");
      }

      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      }
    } catch (err) {
      showToast(err || "Payment failed", "error");
    }
    setIsPaying(false);
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div>
          <p className="text-brand-900 font-medium">
            {row.productId?.productName}
          </p>
          <p className="text-xs text-brand-400">
            {row.productId?.barcode}
          </p>
        </div>
      ),
    },
    {
      key: "qty",
      label: "Qty",
      align: "center",
      render: (row) => {
        const itemId = row.itemId ?? row.id ?? row._id;
        return (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => handleQtyChange(itemId, (row.quantity || 1) - 1)} className="w-6 h-6 rounded-full border border-brand-100 text-brand-600 flex items-center justify-center hover:bg-brand-50">−</button>
            <span className="text-brand-900 font-medium w-5 text-center">{row.quantity}</span>
            <button onClick={() => handleQtyChange(itemId, (row.quantity || 1) + 1)} className="w-6 h-6 rounded-full border border-brand-100 text-brand-600 flex items-center justify-center hover:bg-brand-50">+</button>
          </div>
        );
      },
    },
    { key: "price", label: "Price", align: "right", render: (row) => <span className="text-brand-900">₹{row.price}</span> },
    { key: "subtotal", label: "Subtotal", align: "right", render: (row) => <span className="text-brand-900 font-medium">₹{row.subtotal ?? (row.price ?? 0) * (row.quantity ?? 1)}</span> },
    {
      key: "action", label: "", align: "right",
      render: (row) => (
        <button onClick={() => handleRemove(row.itemId ?? row.id ?? row._id)} className="text-red-500 text-xs font-semibold hover:underline">Remove</button>
      ),
    },
  ];

  // Step 1: search by mobile first
  if (!customerAttached) {
    return (
      <div className="w-full min-h-screen bg-brand-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-brand-100/60 blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative">
          {openBills.length > 0 && <QueueStrip />}

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className={`h-1.5 rounded-full transition-all ${!customerNotFound ? "w-8 bg-brand-600" : "w-4 bg-brand-200"}`} />
            <div className={`h-1.5 rounded-full transition-all ${customerNotFound ? "w-8 bg-brand-600" : "w-4 bg-brand-200"}`} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-brand-900/5 border border-brand-100 p-7">
            {/* Icon badge */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center mb-3 shadow-md shadow-brand-900/20">
                {!customerNotFound ? (
                  <ShoppingBag size={24} className="text-white" />
                ) : (
                  <UserPlus size={24} className="text-white" />
                )}
              </div>
              <p className="text-lg font-semibold text-brand-900">
                {!customerNotFound ? "Start a new bill" : "New customer"}
              </p>
              <p className="text-xs text-brand-400 mt-1">
                {!customerNotFound
                  ? "Look up the customer by mobile number"
                  : "No record found — add their details"}
              </p>
            </div>

            {!customerNotFound ? (
              <>
                <label className="text-xs font-medium text-brand-600 block mb-1.5 uppercase tracking-wide">
                  Mobile number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
                    placeholder="9876543210"
                    className="w-full border border-brand-100 rounded-xl pl-10 pr-3 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearchCustomer}
                  disabled={isSearching}
                  className="w-full mt-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  {isSearching ? (
                    "Searching..."
                  ) : (
                    <>
                      <Search size={15} />
                      Find customer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkipCustomer}
                  className="w-full mt-2.5 text-xs text-brand-400 hover:text-brand-600 py-2 flex items-center justify-center gap-1 transition"
                >
                  Skip — walk-in customer
                  <ArrowRight size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="bg-brand-50 border border-dashed border-brand-200 rounded-lg px-3 py-2.5 mb-4 flex items-center gap-2">
                  <Phone size={13} className="text-brand-400 flex-shrink-0" />
                  <p className="text-xs text-brand-500">
                    No customer for <span className="text-brand-900 font-medium">{customerPhone}</span>
                  </p>
                </div>

                <label className="text-xs font-medium text-brand-600 block mb-1.5 uppercase tracking-wide">
                  Customer name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ravi Kumar"
                    className="w-full border border-brand-100 rounded-xl pl-10 pr-3 py-3 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={handleBackToSearch}
                    className="flex-1 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-xl py-3 text-sm font-medium transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomer}
                    disabled={isSavingCustomer}
                    className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl py-3 text-sm font-medium transition disabled:opacity-60"
                  >
                    {isSavingCustomer ? "Creating..." : "Create & continue"}
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-[11px] text-brand-300 mt-4 flex items-center justify-center gap-1">
            <Receipt size={11} />
            Point of sale · Threadline
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-brand-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-brand-900">Billing</p>
          <p className="text-sm text-brand-400">
            {customerName ? `Customer: ${customerName}${customerPhone ? ` · ${customerPhone}` : ""}` : "Walk-in customer"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAddNewCustomer} className="text-xs text-brand-600 underline flex items-center gap-1">
            <Plus size={12} />
            New customer
          </button>
          <button onClick={handleChangeCustomer} className="text-xs text-brand-400 underline">
            Change customer
          </button>
        </div>
      </div>

      <QueueStrip />
      

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Scan barcode</label>
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={handleScan}
              placeholder="Waiting for scan..."
              disabled={isScanning}
              className="w-full border border-brand-100 rounded-lg px-4 py-3 text-base text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              autoFocus
            />
          </Card>

          <Card className="flex-1">
            <Table columns={columns} data={cartItems} emptyMessage="Cart is empty — scan a barcode to get started" />
          </Card>
        </div>

        <Card className="h-fit sticky top-6" title="Bill summary">
          {!generatedBill ? (
            <Button onClick={handleGenerateBill} isLoading={isGenerating} disabled={cartItems.length === 0}>
              {isGenerating ? "Generating..." : "Generate bill"}
            </Button>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-400">Subtotal</span>
                  <span className="text-brand-900">₹{generatedBill.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-400">GST</span>
                  <span className="text-brand-900">₹{generatedBill.gstAmount}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 mt-1 border-t border-brand-100">
                  <span className="text-brand-900">Total</span>
                  <span className="text-brand-900">₹{generatedBill.grandTotal}</span>
                </div>
              </div>

              <label className="text-sm font-medium text-brand-900 block mb-1.5">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-brand-100 rounded-lg px-3 py-2.5 text-sm text-brand-900 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <Button onClick={handlePayment} isLoading={isPaying}>
                {isPaying ? "Processing..." : "Complete payment"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}