import axiosInstance from "../../app/axiosInstance";

// Get all invoices
export const getInvoices = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `/api/invoices?page=${page}&limit=${limit}`
  );
  return data;
};

// Generate invoice from bill
export const generateInvoice = async (billId) => {
  const { data } = await axiosInstance.post("/api/invoices", {
    billId,
  });
  return data;
};

// Get invoice details
export const getInvoiceById = async (invoiceId) => {
  const { data } = await axiosInstance.get(
    `/api/invoices/${invoiceId}`
  );
  return data;
};

// Download invoice PDF
export const downloadInvoicePdf = async (invoiceId) => {
  const response = await axiosInstance.get(
    `/api/invoices/${invoiceId}/pdf`,
    {
      responseType: "blob",
    }
  );

  return response;
};

// Cancel invoice
export const cancelInvoice = async (invoiceId, reason) => {
  const { data } = await axiosInstance.put(
    `/api/invoices/${invoiceId}/cancel`,
    {
      reason,
    }
  );

  return data;
};

// Browser print
export const printInvoice = () => {
  window.print();
};