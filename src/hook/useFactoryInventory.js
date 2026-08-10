import { useDispatch, useSelector } from "react-redux";
import { fetchFactoryInventoryThunk, addProducedStockThunk } from "../features/stock/factorySlice";

export const useFactoryInventory = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.factoryInventory);

  return {
    inventory: list,
    isLoading: status === "loading",
    error,
    fetchFactoryInventory: () => dispatch(fetchFactoryInventoryThunk()),
    addProducedStock: (productId, quantity) => 
      dispatch(addProducedStockThunk({ productId, quantity })).unwrap(),
  };
};