import { useDispatch, useSelector } from "react-redux";
import {
  createCustomerThunk,
  fetchCustomersThunk,
  fetchCustomerThunk,
  fetchCustomerByPhoneThunk,
  updateCustomerThunk,
  updateCustomerByPhoneThunk,
  deleteCustomerThunk,
  fetchPurchaseHistoryThunk,
  clearCustomer,
} from "../features/customers/customerSlice";

export const useCustomer = () => {
  const dispatch = useDispatch();

  const {
    customers,
    customer,
    purchaseHistory,
    status,
    error,
  } = useSelector((state) => state.customer);

  return {
    customers,
    customer,
    purchaseHistory,
    isLoading: status === "loading",
    error,

    // Get all customers
    fetchCustomers: () =>
      dispatch(fetchCustomersThunk()).unwrap(),

    // Get customer by ID
    fetchCustomer: (customerId) =>
      dispatch(fetchCustomerThunk(customerId)).unwrap(),

    // Get customer by mobile
    fetchCustomerByPhone: (mobile) =>
      dispatch(fetchCustomerByPhoneThunk(mobile)).unwrap(),

    // Create customer
    createCustomer: (data) =>
      dispatch(createCustomerThunk(data)).unwrap(),

    // Update by ID
    updateCustomer: (customerId, data) =>
      dispatch(updateCustomerThunk({ customerId, data })).unwrap(),

    // Update by mobile
    updateCustomerByPhone: (mobile, data) =>
      dispatch(updateCustomerByPhoneThunk({ mobile, data })).unwrap(),

    // Delete customer
    deleteCustomer: (customerId) =>
      dispatch(deleteCustomerThunk(customerId)).unwrap(),

    // Purchase history
    fetchPurchaseHistory: (customerId) =>
      dispatch(fetchPurchaseHistoryThunk(customerId)).unwrap(),

    clearCustomer: () => dispatch(clearCustomer()),
  };
};