import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceThunk,
  searchProductsThunk,
  createExchangeThunk,
  fetchExchangeHistoryThunk,
  settleExchangeThunk,
  setOldProduct,
  setNewProduct,
  clearProductResults,
  setStatusFilter,
  setPage,
  resetExchangeForm,
  clearExchangeSession,
} from "../features/exchange/exchangeSlice";

export const useExchange = () => {
  const dispatch = useDispatch();
  const {
    invoice,
    invoiceItems,
    selectedOldProduct,
    productResults,
    selectedNewProduct,
    lastExchange,
    history,
    pagination,
    statusFilter,
    status,
    error,
  } = useSelector((state) => state.exchange);

  return {
    invoice,
    invoiceItems,
    selectedOldProduct,
    productResults,
    selectedNewProduct,
    lastExchange,
    history,
    pagination,
    statusFilter,
    isLoading: status === "loading",
    error,

    findInvoice: (invoiceNumber) => dispatch(fetchInvoiceThunk(invoiceNumber)).unwrap(),

    searchProducts: (query) => dispatch(searchProductsThunk(query)).unwrap(),

    pickOldProduct: (product) => dispatch(setOldProduct(product)),

    pickNewProduct: (product) => dispatch(setNewProduct(product)),

    clearProductResults: () => dispatch(clearProductResults()),

    createExchange: (payload) => dispatch(createExchangeThunk(payload)).unwrap(),

    loadExchangeHistory: (params) => dispatch(fetchExchangeHistoryThunk(params)).unwrap(),

    settleExchange: (payload) => dispatch(settleExchangeThunk(payload)).unwrap(),

    changeStatusFilter: (statusValue) => dispatch(setStatusFilter(statusValue)),

    changePage: (page) => dispatch(setPage(page)),

    resetForm: () => dispatch(resetExchangeForm()),

    clearSession: () => dispatch(clearExchangeSession()),
  };
};

export default useExchange;