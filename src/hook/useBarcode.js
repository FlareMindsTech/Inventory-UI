import { useDispatch, useSelector } from "react-redux";
import {
  generateBarcodeThunk,
  validateBarcodeThunk,
  fetchBarcodeDetailsThunk,
  clearLookupResult,
} from "../features/barcode/barcodeSlice";

export const useBarcodes = () => {
  const dispatch = useDispatch();
  const { lastGenerated, lookupResult, status, error } = useSelector((state) => state.barcodes);

  return {
    lastGenerated,
    lookupResult,
    isLoading: status === "loading",
    error,
    generateBarcode: (productId) => dispatch(generateBarcodeThunk(productId)).unwrap(),
    validateBarcode: (barcode) => dispatch(validateBarcodeThunk(barcode)).unwrap(),
    fetchBarcodeDetails: (barcode) => dispatch(fetchBarcodeDetailsThunk(barcode)).unwrap(),
    clearLookup: () => dispatch(clearLookupResult()),
  };
};