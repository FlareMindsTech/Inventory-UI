import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettingsThunk,
  updateGstThunk,
  updateDiscountThunk,
  updateInvoicePrefixThunk,
  updateShopInfoThunk,
} from "../features/setting/settingSlice";;

export const useSettings = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.settings);

  return {
    settings: data,
    isLoading: status === "loading",
    error,
    fetchSettings: () => dispatch(fetchSettingsThunk()),
    updateGst: (gstPercentage) => dispatch(updateGstThunk(gstPercentage)).unwrap(),
    updateDiscount: (defaultDiscount) => dispatch(updateDiscountThunk(defaultDiscount)).unwrap(),
    updateInvoicePrefix: (invoicePrefix) => dispatch(updateInvoicePrefixThunk(invoicePrefix)).unwrap(),
    updateShopInfo: (shopData) => dispatch(updateShopInfoThunk(shopData)).unwrap(),
  };
};