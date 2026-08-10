import axiosInstance from "../../app/axiosInstance";

export const getAllProducts = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get("/api/products", { params: { page, limit } });
   console.log("product datassss",res.data);
  return res.data;
 

};

export const getProductById = async (id) => {
  const res = await axiosInstance.get(`/api/products/${id}`);
  return res.data;
};

export const filterProducts = async ({ categoryId, brandId, size }) => {
  const res = await axiosInstance.get("/api/products/filter", { params: { categoryId, brandId, size } });
  return res.data;
};

export const getProductByBarcode = async (barcode) => {
  const res = await axiosInstance.get(`/api/products/barcode/${barcode}`);
  return res.data;
};

export const addProduct = async (productData) => {
  const res = await axiosInstance.post("/api/products", productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await axiosInstance.put(`/api/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axiosInstance.delete(`/api/products/${id}`);
  return res.data;
};

export const updateStockStatus = async (id, stockStatus) => {
  const res = await axiosInstance.put(`/api/products/${id}/stock-status`, { stockStatus });
  return res.data;
};

export const getAllCategories = async () => {
  const res = await axiosInstance.get("/api/categories");
  return res.data;
};

export const getAllBrands = async () => {
  const res = await axiosInstance.get("/api/brands");
  return res.data;
};