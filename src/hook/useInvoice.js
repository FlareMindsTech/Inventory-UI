import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoicesThunk,
  generateInvoiceThunk,
  fetchInvoiceByIdThunk,
  downloadInvoicePdfThunk,
  cancelInvoiceThunk,
  clearSelectedInvoice,
  clearGeneratedInvoice,
  clearInvoicePdf,
} from "../features/invoice/invoiceSlice";
import { printInvoice } from "../features/invoice/invoiceApi";

export const useInvoice = () => {
  const dispatch = useDispatch();

  const {
    invoices,
    selectedInvoice,
    generatedInvoice,
    pdfBlob,
    status,
    error,
  } = useSelector((state) => state.invoice);

  return {
    // State
    invoices,
    selectedInvoice,
    generatedInvoice,
    pdfBlob,
    isLoading: status === "loading",
    error,

    // Actions
    fetchInvoices: (page = 1, limit = 10) =>
      dispatch(fetchInvoicesThunk({ page, limit })).unwrap(),

    generateInvoice: (billId) =>
      dispatch(generateInvoiceThunk(billId)).unwrap(),

    fetchInvoiceById: (invoiceId) =>
      dispatch(fetchInvoiceByIdThunk(invoiceId)).unwrap(),

    downloadPdf: (invoiceId) =>
      dispatch(downloadInvoicePdfThunk(invoiceId)).unwrap(),

    cancelInvoice: (invoiceId, reason) =>
      dispatch(cancelInvoiceThunk({ invoiceId, reason })).unwrap(),

    printInvoice: () => printInvoice(),

    clearSelectedInvoice: () =>
      dispatch(clearSelectedInvoice()),

    clearGeneratedInvoice: () =>
      dispatch(clearGeneratedInvoice()),

    clearInvoicePdf: () =>
      dispatch(clearInvoicePdf()),
  };
};