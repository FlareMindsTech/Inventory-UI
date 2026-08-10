// hook/useStockTransfer.js
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTransferHistoryThunk,
  transferToRetailThunk,
  transferToOnlineThunk,
  cancelTransferThunk,
} from "../features/stock/stocktransferSlice";

export const useStockTransfer = () => {
  const dispatch = useDispatch();
  const { history, status, error } = useSelector((state) => state.stockTransfer);

  return {
    history,
    isLoading: status === "loading",
    error,
    fetchHistory: async () => {
      try {
        const result = await dispatch(fetchTransferHistoryThunk()).unwrap();
        console.log("Fetch history result:", result);
        return result;
      } catch (err) {
        console.error("Fetch history error:", err);
        throw err;
      }
    },
    transferToRetail: (productId, quantity) =>
      dispatch(transferToRetailThunk({ 
        productId, 
        quantity,
        fromLocation: "Factory",
        toLocation: "Retail Shop"
      })).unwrap(),
    transferToOnline: (productId, quantity) =>
      dispatch(transferToOnlineThunk({ 
        productId, 
        quantity,
        fromLocation: "Factory",
        toLocation: "Online Store"
      })).unwrap(),
    cancelTransfer: async (id) => {
      try {
        const result = await dispatch(cancelTransferThunk(id)).unwrap();
        console.log("Cancel transfer result:", result);
        return result;
      } catch (err) {
        console.error("Cancel transfer error:", err);
        throw err;
      }
    },
  };
};