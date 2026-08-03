import { createContext, useContext, useState } from "react";

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);

  const addInvoice = ({ items, subtotal, tax, total, paymentMethod = "Cash" }) => {
    const invoice = {
      id: `INV-${Date.now().toString().slice(-8)}`,
      date: new Date(),
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
    };
    setInvoices((prev) => [invoice, ...prev]);
    return invoice;
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error("useInvoices must be used inside InvoiceProvider");
  return ctx;
}