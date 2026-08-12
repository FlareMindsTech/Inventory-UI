

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

      .addCase(fetchCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
      })

      .addCase(fetchCustomerByPhoneThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
      })

  
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;
        state.customers.unshift(action.payload);
      })

      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        state.customer = action.payload;

        state.customers = state.customers.map((c) =>
          (c.customerId ?? c._id) ===
          (action.payload.customerId ?? action.payload._id)
            ? action.payload
            : c
        );
      })

    
      .addCase(updateCustomerByPhoneThunk.fulfilled, (state, action) => {
        state.customer = action.payload;

        state.customers = state.customers.map((c) =>
          (c.customerId ?? c._id) ===
          (action.payload.customerId ?? action.payload._id)
            ? action.payload
            : c
        );
      })

   
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (c) => (c.customerId ?? c._id) !== action.payload
        );

        if ((state.customer?.customerId ?? state.customer?._id) === action.payload) {
          state.customer = null;
        }
      })

   
      .addCase(fetchPurchaseHistoryThunk.fulfilled, (state, action) => {
        state.purchaseHistory = action.payload || [];
      });
  },
});

export const { clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;