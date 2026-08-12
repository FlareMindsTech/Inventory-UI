import axiosInstance from "../../app/axiosInstance";


export const getInvoices = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `/api/invoices?page=${page}&limit=${limit}`
  );
 
  return data;
};


export const generateInvoice = async (billId) => {
  const { data } = await axiosInstance.post("/api/invoices", {
    billId,
  });
  return data;
};


export const getInvoiceById = async (invoiceId) => {
  const { data } = await axiosInstance.get(
    `/api/invoices/${invoiceId}`
  );
  return data;
};


export const downloadInvoicePdf = async (invoiceId) => {
  const response = await axiosInstance.get(
    `/api/invoices/${invoiceId}/pdf`,
    {
      responseType: "blob",
    }
  );

  return response;
};


export const cancelInvoice = async (invoiceId, reason) => {
  const { data } = await axiosInstance.put(
    `/api/invoices/${invoiceId}/cancel`,
    {
      reason,
    }
  );

  return data;
};

export const printInvoice = () => {
  window.print();
};