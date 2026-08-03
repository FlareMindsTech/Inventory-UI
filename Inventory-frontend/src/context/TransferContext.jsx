import { createContext, useContext, useState } from "react";

const TransferContext = createContext(null);

export function TransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]);

  const addTransfer = ({ outlet, items }) => {
    const transfer = {
      id: `TR${Date.now()}`,
      outlet,
      items,
      totalItems: items.length,
      totalQty: items.reduce((sum, item) => sum + item.qty, 0),
      date: new Date().toLocaleDateString(),
      status: "Completed",
    };

    setTransfers((prev) => [transfer, ...prev]);

    return transfer;
  };

  return (
    <TransferContext.Provider
      value={{
        transfers,
        addTransfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfers() {
  const context = useContext(TransferContext);

  if (!context) {
    throw new Error("useTransfers must be used inside TransferProvider");
  }

  return context;
}