import { useDispatch, useSelector } from "react-redux";
import {
  scanBarcodeThunk,
  addItemToBillThunk,
  removeItemFromBillThunk,
  updateItemQuantityThunk,
  generateBillThunk,
  processPaymentThunk,
  clearScannedProduct,
  clearBillingSession,
  setCustomerId,
} from "../features/billing/billingSlice";

export const useBilling = () => {
  const dispatch = useDispatch();
const {
  scannedProduct,
  cartItems,
 generatedBill,
  paymentResult,
  customerId,
  status,
  error,
} = useSelector((state) => state.billing);
 return {
  scannedProduct,
  cartItems,
  generatedBill,
  paymentResult,
  customerId,
  isLoading: status === "loading",
  error,

  scanBarcode: (barcode) => dispatch(scanBarcodeThunk(barcode)).unwrap(),

  addItemToBill: (productId, quantity, customerId) =>
    dispatch(addItemToBillThunk({ productId, quantity, customerId })).unwrap(),

  removeItem: (itemId) =>
    dispatch(removeItemFromBillThunk(itemId)).unwrap(),

  updateItemQuantity: (itemId, quantity) =>
    dispatch(updateItemQuantityThunk({ itemId, quantity })).unwrap(),

  generateBill: () =>
    dispatch(generateBillThunk()).unwrap(),

  processPayment: (billId, paymentMethod) =>
    dispatch(processPaymentThunk({ billId, paymentMethod })).unwrap(),

  clearScanned: () => dispatch(clearScannedProduct()),
  clearSession: () => dispatch(clearBillingSession()),

  setCustomer: (id) => dispatch(setCustomerId(id)), // ✅ add this
};
};