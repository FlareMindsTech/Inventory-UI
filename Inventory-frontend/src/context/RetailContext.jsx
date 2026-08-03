import { createContext, useContext, useState } from "react";

const RetailContext = createContext(null);

export function RetailProvider({ children }) {
  const [retailProducts, setRetailProducts] = useState([]);

  const addRetailStock = (items) => {
    setRetailProducts((prev) => {
      const updated = [...prev];
console.log("Retail Products:", retailProducts);
      items.forEach((item) => {
        const existing = updated.find((p) => p.id === item.id);

        if (existing) {
          existing.stock += item.qty;
        } else {
          updated.push({
            ...item,
            stock: item.qty,
          });
        }
      });

      return [...updated];
    });
  };

  const reduceRetailStock = (id, qty) => {
    setRetailProducts((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, stock: Math.max(0, item.stock - qty) }
            : item
        )
        .filter((item) => item.stock > 0)
    );
  };

  return (
    <RetailContext.Provider
      value={{
        retailProducts,
        addRetailStock,
        reduceRetailStock,
      }}
    >
      {children}
    </RetailContext.Provider>
  );
}

export function useRetail() {
  const context = useContext(RetailContext);

  if (!context) {
    throw new Error("useRetail must be used inside RetailProvider");
  }

  return context;
}