import axiosInstance from "../../app/axiosInstance";

export const generateBarcode = async (productId) => {
  const res = await axiosInstance.post("/api/barcodes/generate", { productId });
  return res.data;
};

export const validateBarcode = async (barcode) => {
  const res = await axiosInstance.post("/api/barcodes/validate", { barcode });
  return res.data;
};

export const getBarcodeDetails = async (barcode) => {
  const res = await axiosInstance.get(`/api/barcodes/${barcode}`);
  return res.data;
};