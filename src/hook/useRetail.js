// hook/useRetail.js
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRetailInventoryThunk,
  fetchRetailHistoryThunk,
  fetchLowStockThunk,
  receiveRetailStockThunk,
  adjustRetailStockThunk,
  updateRetailStockThunk,
  clearRetailError,
} from "../features/retail/retailSlice";

export const useRetail = () => {
  const dispatch = useDispatch();
  const { inventory, history, lowStock, status, error } = useSelector(
    (state) => {
      
      return state.retail;
    }
  );

  return {
    // State
    retailProducts: inventory,
    history,
    lowStock,
    isLoading: status === "loading",
    error,
    
    // Actions
    fetchRetailInventory: () => {
      
      return dispatch(fetchRetailInventoryThunk());
    },
    fetchRetailHistory: () => dispatch(fetchRetailHistoryThunk()),
    fetchLowStock: () => dispatch(fetchLowStockThunk()),
    receiveStock: (transferId) =>
  dispatch(receiveRetailStockThunk({ transferId })).unwrap(),
    adjustStock: (productId, actualQuantity, reason) =>
      dispatch(adjustRetailStockThunk({ productId, actualQuantity, reason })).unwrap(),
    updateStock: (id, data) =>
      dispatch(updateRetailStockThunk({ id, data })).unwrap(),
    clearError: () => dispatch(clearRetailError()),
  };
};