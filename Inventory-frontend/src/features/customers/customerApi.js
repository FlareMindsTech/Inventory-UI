import axiosInstance from "../../app/axiosInstance";

// Get All Customers
export const getAllCustomers = async () => {
  const response = await axiosInstance.get("/api/customers");
  return response.data;
};

// Get Customer by ID
export const getCustomerById = async (customerId) => {
  const response = await axiosInstance.get(`/api/customers/${customerId}`);
  return response.data;
};

// Get Customer by Mobile
export const getCustomerByPhone = async (mobile) => {
  const response = await axiosInstance.get(`/api/customers/phone/${mobile}`);
  return response.data;
};

// Create Customer
export const createCustomer = async (data) => {
  const response = await axiosInstance.post("/api/customers", data);
  return response.data;
};

// Update by Customer ID
export const updateCustomer = async (customerId, data) => {
  const response = await axiosInstance.put(`/api/customers/${customerId}`, data);
  return response.data;
};

// Update by Mobile
export const updateCustomerByPhone = async (mobile, data) => {
  const response = await axiosInstance.put(`/api/customers/phone/${mobile}`, data);
  return response.data;
};

// Delete Customer
export const deleteCustomer = async (customerId) => {
  const response = await axiosInstance.delete(`/api/customers/${customerId}`);
  return response.data;
};

// Purchase History
export const getCustomerPurchaseHistory = async (customerId) => {
  const response = await axiosInstance.get(
    `/api/customers/${customerId}/purchases`
  );
  return response.data;
};