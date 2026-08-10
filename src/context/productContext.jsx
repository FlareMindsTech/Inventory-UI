import { createContext, useContext, useState } from "react";
import { generateBarcode } from "../utilis/generatebarCode";

const initialProducts = [
  { id: 1, name: "Polo Shirt", sku: "TS001", category: "Men", size: "L", price: 899, stock: 120, img: "👕", barcode: "TS001849213" },
  { id: 2, name: "Hoodie", sku: "HD002", category: "Winter", size: "XL", price: 1499, stock: 40, img: "🧥", barcode: "HD002573102" },
  { id: 3, name: "Denim Jacket", sku: "DJ003", category: "Outerwear", size: "M", price: 2199, stock: 18, img: "🧥", barcode: "DJ003291847" },
  { id: 4, name: "Cotton Kurta", sku: "CK004", category: "Ethnic", size: "L", price: 1299, stock: 65, img: "👘", barcode: "CK004610532" },
  { id: 5, name: "Silk Saree", sku: "SS005", category: "Ethnic", size: "Free", price: 3499, stock: 8, img: "🥻", barcode: "SS005738294" },
];

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
    console.log("ProductProvider mounted, products:", products);

  const addProduct = (formData) => {
    const newProduct = {
      ...formData,
      id: Date.now(),
      img: "👕",
      barcode: generateBarcode(formData.sku),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id, formData) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...formData } : p)));
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Called from Billing after a successful bill, to deduct sold stock
  const reduceStock = (id, qty) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p))
    );
  };
const transferStock = (items) => {
  setProducts((prev) =>
    prev.map((product) => {
      const transferItem = items.find(
        (item) => item.id === product.id
      );

      if (!transferItem) return product;

      return {
        ...product,
        stock: Math.max(0, product.stock - transferItem.qty),
      };
    })
  );
};
  const findByBarcode = (barcode) => products.find((p) => p.barcode === barcode);

  return (
    <ProductContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, reduceStock, findByBarcode,transferStock }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}