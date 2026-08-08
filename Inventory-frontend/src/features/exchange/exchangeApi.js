import axiosInstance from "../../app/axiosInstance";
import { searchBillingProducts } from "../billing/billingApi"; // reuse existing product search for picking the replacement product

// GET /api/invoices/:invoiceId  (invoiceId may be a Mongo _id OR the invoice number)
export const getInvoiceByNumber = async (invoiceNumber) => {
  const res = await axiosInstance.get(`/api/invoices/${invoiceNumber}`);
  return res.data;
};

// reuse the same product search billing uses, so the "pick new product" UX matches scanning/searching in Billing
export const searchProductsForExchange = async (query) => {
  return searchBillingProducts(query);
};

// POST /api/exchanges
// body: { invoiceNumber, oldProductId, newProductId, quantity, settlementMethod }
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

// GET /api/returns/history?page=&limit=&status=&type=exchange
export const getExchangeHistory = async ({ page = 1, limit = 10, status = "" } = {}) => {
  const res = await axiosInstance.get("/api/returns/history", {
    params: {
      page,
      limit,
      type: "exchange",
      ...(status ? { status } : {}), // omit status entirely when not filtering, don't send status=""
    },
  });
  return res.data;
};

// POST /api/refunds
export const settleExchange = async ({ returnId, refundMethod }) => {
  const res = await axiosInstance.post("/api/refunds", { returnId, refundMethod });
  return res.data;
};