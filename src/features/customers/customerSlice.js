// src/features/customer/customerSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  updateCustomerByPhone,
  deleteCustomer,
  getCustomerPurchaseHistory,
} from "./customerApi";

const extractData = (response) =>
  response.Result || response.data || response.result || response;

// Get All Customers
export const fetchCustomersThunk = createAsyncThunk(
  "customer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCustomers();
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to fetch customers"
      );
    }
  }
);

// Get Customer By ID
export const fetchCustomerThunk = createAsyncThunk(
  "customer/fetchById",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getCustomerById(customerId);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to fetch customer"
      );
    }
  }
);

// Get Customer By Mobile
export const fetchCustomerByPhoneThunk = createAsyncThunk(
  "customer/fetchByPhone",
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await getCustomerByPhone(mobile);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Customer not found"
      );
    }
  }
);

// Create Customer
export const createCustomerThunk = createAsyncThunk(
  "customer/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createCustomer(data);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to create customer"
      );
    }
  }
);

// Update By ID
export const updateCustomerThunk = createAsyncThunk(
  "customer/update",
  async ({ customerId, data }, { rejectWithValue }) => {
    try {
      const response = await updateCustomer(customerId, data);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to update customer"
      );
    }
  }
);

// Update By Mobile
export const updateCustomerByPhoneThunk = createAsyncThunk(
  "customer/updateByPhone",
  async ({ mobile, data }, { rejectWithValue }) => {
    try {
      const response = await updateCustomerByPhone(mobile, data);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to update customer"
      );
    }
  }
);

// Delete
export const deleteCustomerThunk = createAsyncThunk(
  "customer/delete",
  async (customerId, { rejectWithValue }) => {
    try {
      await deleteCustomer(customerId);
      return customerId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to delete customer"
      );
    }
  }
);

// Purchase History
export const fetchPurchaseHistoryThunk = createAsyncThunk(
  "customer/history",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getCustomerPurchaseHistory(customerId);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to fetch purchase history"
      );
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    customers: [],
    customer: null,
    purchaseHistory: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearCustomer(state) {
      state.customer = null;
      state.purchaseHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // Get All Customers
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload || [];
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get Customer By ID
      .addCase(fetchCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
      })

      // Get Customer By Phone
      .addCase(fetchCustomerByPhoneThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
      })

      // Create
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
        state.customers.unshift(action.payload);
      })

      // Update By ID
      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;

        state.customers = state.customers.map((c) =>
          (c.customerId ?? c._id) ===
          (action.payload.customerId ?? action.payload._id)
            ? action.payload
            : c
        );
      })

      // Update By Phone
      .addCase(updateCustomerByPhoneThunk.fulfilled, (state, action) => {
        state.customer = action.payload;

        state.customers = state.customers.map((c) =>
          (c.customerId ?? c._id) ===
          (action.payload.customerId ?? action.payload._id)
            ? action.payload
            : c
        );
      })

      // Delete
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (c) => (c.customerId ?? c._id) !== action.payload
        );

        if ((state.customer?.customerId ?? state.customer?._id) === action.payload) {
          state.customer = null;
        }
      })

      // Purchase History
      .addCase(fetchPurchaseHistoryThunk.fulfilled, (state, action) => {
        state.purchaseHistory = action.payload || [];
      });
  },
});

export const { clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;