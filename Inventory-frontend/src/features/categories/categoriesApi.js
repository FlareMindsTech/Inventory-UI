import axiosInstance from "../../app/axiosInstance";

export const getAllCategories = async () => {
  const res = await axiosInstance.get("/api/categories");
  return res.data;
};
export const createCategory = async (data) => {
  const res = await axiosInstance.post("/api/categories", data);
  return res.data;
};
export const updateCategory = async (id, data) => {
  const res = await axiosInstance.put(`/api/categories/${id}`, data);
  return res.data;
};
export const deleteCategory = async (id) => {
  const res = await axiosInstance.delete(`/api/categories/${id}`);
  return res.data;
};