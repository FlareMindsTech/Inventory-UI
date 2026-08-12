
import axiosInstance from "../../app/axiosInstance";


export const getRetailInventorySummary = async () => {
  const res = await axiosInstance.get("/api/retail-inventory");

  return res.data;
};


export const getRetailInventoryHistory = async () => {
  const res = await axiosInstance.get("/api/retail-inventory/history");
  return res.data;
};

export const getLowStockProducts = async () => {
  const res = await axiosInstance.get("/api/retail-inventory/low-stock");
  return res.data;
};

export const receiveRetailStock = async ({ transferId }) => {
  const res = await axiosInstance.post("/api/retail-inventory/receive", { transferId });
  
  return res.data;

};


export const adjustRetailStock = async ({  productId,
    actualQuantity,reason }) => {
  const res = await axiosInstance.put("/api/retail-inventory/adjust", {
   productId,
    actualQuantity,
    reason: reason || "Manual adjustment"
  });
  return res.data;
};

export const updateRetailStock = async (id, data) => {
  const res = await axiosInstance.put(`/api/retail-inventory/${id}`, data);
  return res.data;
};