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

   
    fetchCustomers: () =>
      dispatch(fetchCustomersThunk()).unwrap(),

 
    fetchCustomer: (customerId) =>
      dispatch(fetchCustomerThunk(customerId)).unwrap(),

    fetchCustomerByPhone: (mobile) =>
      dispatch(fetchCustomerByPhoneThunk(mobile)).unwrap(),

    
    createCustomer: (data) =>
      dispatch(createCustomerThunk(data)).unwrap(),

   
    updateCustomer: (customerId, data) =>
      dispatch(updateCustomerThunk({ customerId, data })).unwrap(),

    
    updateCustomerByPhone: (mobile, data) =>
      dispatch(updateCustomerByPhoneThunk({ mobile, data })).unwrap(),

    
    deleteCustomer: (customerId) =>
      dispatch(deleteCustomerThunk(customerId)).unwrap(),

    fetchPurchaseHistory: (customerId) =>
      dispatch(fetchPurchaseHistoryThunk(customerId)).unwrap(),

    clearCustomer: () => dispatch(clearCustomer()),
  };
};