// features/retail/retailInventoryApi.js
import axiosInstance from "../../app/axiosInstance";

// Get Retail Inventory Summary
export const getRetailInventorySummary = async () => {
  const res = await axiosInstance.get("/api/retail-inventory");
  console.log("getRetailInventorySummary response:", res.data);
  return res.data;
};

// Get Retail Inventory History
export const getRetailInventoryHistory = async () => {
  const res = await axiosInstance.get("/api/retail-inventory/history");
  return res.data;
};

// Get Low Stock Retail Products
export const getLowStockProducts = async () => {
  const res = await axiosInstance.get("/api/retail-inventory/low-stock");
  return res.data;
};

export const receiveRetailStock = async ({ transferId }) => {
  const res = await axiosInstance.post("/api/retail-inventory/receive", { transferId });
  
  return res.data;

};

// Adjust Retail Stock (Manual)
export const adjustRetailStock = async ({  productId,
    actualQuantity,reason }) => {
  const res = await axiosInstance.put("/api/retail-inventory/adjust", {
   productId,
    actualQuantity,
    reason: reason || "Manual adjustment"
  });
  return res.data;
};

// Update Retail Stock Config
export const updateRetailStock = async (id, data) => {
  const res = await axiosInstance.put(`/api/retail-inventory/${id}`, data);
  return res.data;
};