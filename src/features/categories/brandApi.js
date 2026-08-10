import axiosInstance from "../../app/axiosInstance";

export const getAllBrands = async () => {
  const res = await axiosInstance.get("/api/brands");
  return res.data;
};
export const createBrand = async (data) => {
  const res = await axiosInstance.post("/api/brands", data);
 
  return res.data;
};
export const updateBrand = async (id, data) => {
  const res = await axiosInstance.put(`/api/brands/${id}`, data);
  return res.data;
};
export const deleteBrand = async (id) => {
  const res = await axiosInstance.delete(`/api/brands/${id}`);
  console.log(res.data);
  return res.data;
};