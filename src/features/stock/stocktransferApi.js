
import axiosInstance from "../../app/axiosInstance";


export const getTransferHistory = async () => {
  const res = await axiosInstance.get("/api/stock-transfer/history");
  return res.data;
};

export const transferToRetail = async ({ productId, quantity, fromLocation, toLocation }) => {
  const res = await axiosInstance.post("/api/stock-transfer/retail", {
    productId,
    quantity,
    fromLocation: fromLocation || "Factory",
    toLocation: toLocation || "Retail Shop"
  });
  return res.data;
};

export const transferToOnline = async ({ productId, quantity, fromLocation, toLocation }) => {
  const res = await axiosInstance.post("/api/stock-transfer/online", {
    productId,
    quantity,
    fromLocation: fromLocation || "Factory",
    toLocation: toLocation || "Online Store"
  });
  return res.data;
};


export const cancelTransfer = async (id) => {
  const res = await axiosInstance.put(`/api/stock-transfer/${id}/cancel`);
  return res.data;
};