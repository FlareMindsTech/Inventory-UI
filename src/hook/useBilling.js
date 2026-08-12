import { useDispatch, useSelector } from "react-redux";
import {
  scanBarcodeThunk,
  addItemToBillThunk,
  removeItemFromBillThunk,
  updateItemQuantityThunk,
  generateBillThunk,
  processPaymentThunk,
  startNewBillThunk,
  fetchOpenBillsThunk,
  deleteOpenBillThunk,
  clearScannedProduct,
  clearBillingSession,
  setCustomerId,
  switchActiveBill,
} from "../features/billing/billingSlice";

export const useBilling = () => {
  const dispatch = useDispatch();
  const {
    scannedProduct,
    cartItems,
    generatedBill,
    paymentResult,
    customerId,
    currentBill,
    activeBillId,
    openBills,
    status,
    error,
  } = useSelector((state) => state.billing);

  return {
    scannedProduct,
    cartItems,
    generatedBill,
    paymentResult,
    customerId,
    currentBill,
    activeBillId,
    openBills,
    isLoading: status === "loading",
    error,

    scanBarcode: (barcode) => dispatch(scanBarcodeThunk(barcode)).unwrap(),

   
    addItemToBill: (productId, quantity, customerId, billId) =>
      dispatch(addItemToBillThunk({ billId, productId, quantity, customerId })).unwrap(),

    removeItem: (itemId) => dispatch(removeItemFromBillThunk(itemId)).unwrap(),

    updateItemQuantity: (itemId, quantity) =>
      dispatch(updateItemQuantityThunk({ itemId, quantity })).unwrap(),

    generateBill: (billId) => dispatch(generateBillThunk(billId)).unwrap(),

    processPayment: (billId, paymentMethod) =>
      dispatch(processPaymentThunk({ billId, paymentMethod })).unwrap(),

    clearScanned: () => dispatch(clearScannedProduct()),
    clearSession: () => dispatch(clearBillingSession()),
    setCustomer: (id) => dispatch(setCustomerId(id)),

  
    startNewBill: (customerId) => dispatch(startNewBillThunk(customerId)).unwrap(),

    
    loadOpenBills: () => dispatch(fetchOpenBillsThunk()).unwrap(),

    
    discardBill: (billId) => dispatch(deleteOpenBillThunk(billId)).unwrap(),

  
    switchBill: (billId) => dispatch(switchActiveBill(billId)),
  };
};