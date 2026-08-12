import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTransferHistory,
  transferToRetail,
  transferToOnline,
  cancelTransfer,
} from "./stocktransferApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const fetchTransferHistoryThunk = createAsyncThunk(
  "stockTransfer/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const result = extractData(await getTransferHistory());
      return result.transfers || result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load transfer history");
    }
  }
);

// FIX: Add fromLocation and toLocation to retail transfer
export const transferToRetailThunk = createAsyncThunk(
  "stockTransfer/toRetail",
  async ({ productId, quantity, fromLocation, toLocation }, { rejectWithValue }) => {
    try {
      const payload = {
        productId,
        quantity,
        fromLocation: fromLocation || "Factory",
        toLocation: toLocation || "Retail Shop"
      };
      return extractData(await transferToRetail(payload));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Transfer to retail failed");
    }
  }
);


export const transferToOnlineThunk = createAsyncThunk(
  "stockTransfer/toOnline",
  async ({ productId, quantity, fromLocation, toLocation }, { rejectWithValue }) => {
    try {
      const payload = {
        productId,
        quantity,
        fromLocation: fromLocation || "Factory",
        toLocation: toLocation || "Online Store"
      };
      return extractData(await transferToOnline(payload));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Transfer to online failed");
    }
  }
);

export const cancelTransferThunk = createAsyncThunk(
  "stockTransfer/cancel",
  async (id, { rejectWithValue }) => {
    try {
      await cancelTransfer(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to cancel transfer");
    }
  }
);

const stockTransferSlice = createSlice({
  name: "stockTransfer",
  initialState: {
    history: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferHistoryThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTransferHistoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.history = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTransferHistoryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(transferToRetailThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(transferToRetailThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.history.unshift(action.payload);
        }
      })
      .addCase(transferToRetailThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(transferToOnlineThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(transferToOnlineThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.history.unshift(action.payload);
        }
      })
      .addCase(transferToOnlineThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(cancelTransferThunk.fulfilled, (state, action) => {
        const idx = state.history.findIndex(
          (t) => (t.id ?? t.transferId) === action.payload
        );
        if (idx !== -1) {
          state.history[idx] = { 
            ...state.history[idx], 
            status: "Cancelled" 
          };
        }
      });
  },
});

export default stockTransferSlice.reducer;