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
    activeBillId,
    openBills,
    isLoading: status === "loading",
    error,

    scanBarcode: (barcode) => dispatch(scanBarcodeThunk(barcode)).unwrap(),

    // billId is optional — omit it to keep existing single-bill behavior;
    // pass the active queued bill's id to target a specific customer's cart.
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

    // ----- waiting queue -----

    // starts a fresh, isolated bill for a new customer without touching
    // whichever bill is currently active/open.
    startNewBill: (customerId) => dispatch(startNewBillThunk(customerId)).unwrap(),

    // loads every unpaid bill for the cashier — call on page mount to restore the queue.
    loadOpenBills: () => dispatch(fetchOpenBillsThunk()).unwrap(),

    // discards an unpaid bill entirely (e.g. customer walked away).
    discardBill: (billId) => dispatch(deleteOpenBillThunk(billId)).unwrap(),

    // switches which queued customer's cart is shown on screen.
    switchBill: (billId) => dispatch(switchActiveBill(billId)),
  };
};