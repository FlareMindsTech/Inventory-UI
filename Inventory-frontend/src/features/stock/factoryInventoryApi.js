import axiosInstance from "../../app/axiosInstance";

export const getFactoryInventorySummary = async () => {
  const res = await axiosInstance.get("/api/factory-inventory");
  return res.data;
};
export const addProducedStock = async ({ productId, quantity }) => {
  const res = await axiosInstance.post("/api/factory-inventory", { productId, quantity });
  return res.data;
};