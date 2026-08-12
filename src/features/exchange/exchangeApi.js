import axiosInstance from "../../app/axiosInstance";
import { searchBillingProducts } from "../billing/billingApi"; 


export const getInvoiceByNumber = async (invoiceNumber) => {
  const res = await axiosInstance.get(`/api/invoices/${invoiceNumber}`);
  return res.data;
};


export const searchProductsForExchange = async (query) => {
  return searchBillingProducts(query);
};


export const createExchange = async ({
  invoiceNumber,
  oldProductId,
  newProductId,
  quantity,
  settlementMethod,
}) => {
  const res = await axiosInstance.post("/api/exchanges", {
    invoiceNumber,
    oldProductId,
    newProductId,
    quantity,
    settlementMethod,
  });
  return res.data;
};


export const getExchangeHistory = async ({ page = 1, limit = 10, status = "" } = {}) => {
  const res = await axiosInstance.get("/api/returns/history", {
    params: {
      page,
      limit,
      type: "exchange",
      ...(status ? { status } : {}), 
    },
  });
  return res.data;
};

export const settleExchange = async ({ returnId, refundMethod }) => {
  const res = await axiosInstance.post("/api/refunds", { returnId, refundMethod });
  return res.data;
};

