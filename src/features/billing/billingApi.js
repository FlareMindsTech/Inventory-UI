import axiosInstance from "../../app/axiosInstance";

export const scanBarcode = async (barcode) => {
  const res = await axiosInstance.post("/api/billing/scan", { barcode });
  return res.data;
};

export const searchBillingProducts = async (query) => {
  const res = await axiosInstance.get("/api/billing/search", { params: { q: query } });
  return res.data;
};


export const addItemToBill = async ({ billId, productId, quantity, customerId }) => {
  const res = await axiosInstance.post("/api/billing/items", { billId, productId, quantity, customerId });
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


export const generateBill = async (billId) => {
  const res = await axiosInstance.post("/api/billing/generate", billId ? { billId } : {});
  return res.data;
};

export const processPayment = async ({ billId, paymentMethod }) => {
  const res = await axiosInstance.post("/api/billing/payment", { billId, paymentMethod });
  return res.data;
};


export const startNewBill = async (customerId) => {
  const res = await axiosInstance.post("/api/billing/bills", customerId ? { customerId } : {});
  return res.data;
};

export const getOpenBills = async () => {
  const res = await axiosInstance.get("/api/billing/bills");
  return res.data;
};

export const deleteOpenBill = async (billId) => {
  const res = await axiosInstance.delete(`/api/billing/bills/${billId}`);
  return res.data;
};