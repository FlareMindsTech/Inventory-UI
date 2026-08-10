import axiosInstance from "../../app/axiosInstance";

export const getSettings =async ()=>{
    const res=await axiosInstance.get("/api/settings");
    return res.data;
}

export const gstConfigUpdate=async (gstPercentage)=>
{
    const res=await axiosInstance.put("/api/settings/gst", { gstPercentage });
    return res.data;
}

export const updateDiscountPercentage=async (defaultDiscount)=>{
    const res=await axiosInstance.put("/api/settings/discount",{defaultDiscount});
    return res.data;
}

export const updateInvoicePrefix = async (invoicePrefix) => {
  const res = await axiosInstance.put("/api/settings/invoice-prefix", { invoicePrefix });
  return res.data;
};

export const updateShopInfo = async ({ shopName, address, phone, gstNumber }) => {
  const res = await axiosInstance.put("/api/settings/shop", { shopName, address, phone, gstNumber });
  return res.data;
};