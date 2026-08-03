import axiosInstance from "../../app/axiosInstance";


export const salesApi = {

  getDailySales: (startDate, endDate) =>
    axiosInstance.get(
      `/api/sales/daily?startDate=${startDate}&endDate=${endDate}`
    ),


  getMonthlySales: (year) =>
    axiosInstance.get(
      `/api/sales/monthly?year=${year}`
    ),


  getYearlySales: () =>
    axiosInstance.get(
      `/api/sales/yearly`
    ),


  getSalesByProduct: (productId) =>
    axiosInstance.get(
      `/api/sales/product?productId=${productId}`
    ),


  getSalesByStaff: (staffId) =>
    axiosInstance.get(
      `/api/sales/staff?staffId=${staffId}`
    ),


  getSalesByCategory: (categoryId) =>
    axiosInstance.get(
      `/api/sales/category?categoryId=${categoryId}`
    ),


  getSalesByBrand: (brandId) =>
    axiosInstance.get(
      `/api/sales/brand?brandId=${brandId}`
    )

};