import axiosInstance from "../../app/axiosInstance";

export const scanBarcode = async (barcode) => {
  const res = await axiosInstance.post("/api/billing/scan", { barcode });
  return res.data;
};

export const searchBillingProducts = async (query) => {
  const res = await axiosInstance.get("/api/billing/search", { params: { q: query } });
  return res.data;
};

export const addItemToBill = async ({ productId, quantity, customerId }) => {
  const res = await axiosInstance.post("/api/billing/items", { productId, quantity, customerId });
  return res.data;
};

export const removeItemFromBill = async (itemId) => {
  const res = await axiosInstance.delete(`/api/billing/items/${itemId}`);
  return res.data;
};

export const updateItemQuantity = async (itemId, quantity) => {
  const res = await axiosInstance.put(`/api/billing/items/${itemId}`, { quantity });
  return res.data;
};

export const generateBill = async () => {
  const res = await axiosInstance.post("/api/billing/generate");
  return res.data;
};

export const processPayment = async ({ billId, paymentMethod }) => {
  const res = await axiosInstance.post("/api/billing/payment", { billId, paymentMethod });
  return res.data;
};