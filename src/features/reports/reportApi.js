import axiosInstance from "../../app/axiosInstance";

const BASE = "/api/reports";

export const reportsAPI = {
  getDashboardSummary: () => axiosInstance.get(`${BASE}/dashboard`),

  getSalesReport: (startDate, endDate) =>
    axiosInstance.get(`${BASE}/sales`, { params: { startDate, endDate } }),

  getInventoryReport: () => axiosInstance.get(`${BASE}/inventory`),

  getFactoryInventoryReport: () =>
    axiosInstance.get(`${BASE}/factory-inventory`),

  getRetailInventoryReport: () =>
    axiosInstance.get(`${BASE}/retail-inventory`),

  getStockTransferReport: (startDate, endDate) =>
    axiosInstance.get(`${BASE}/stock-transfer`, { params: { startDate, endDate } }),

  getGstReport: (startDate, endDate) =>
    axiosInstance.get(`${BASE}/gst`, { params: { startDate, endDate } }),

  getProfitReport: (startDate, endDate) =>
    axiosInstance.get(`${BASE}/profit`, { params: { startDate, endDate } }),

  getLowStockReport: () => axiosInstance.get(`${BASE}/low-stock`),

  getBestSellingReport: (startDate, endDate) =>
    axiosInstance.get(`${BASE}/best-selling`, { params: { startDate, endDate } })
};
export const salesAPI = {
  getSalesByStaff: (staffId) =>
    axiosInstance.get(`${BASE}/staff`, { params: { staffId } }),
};