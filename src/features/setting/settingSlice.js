import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSettings,
  gstConfigUpdate,
  updateDiscountPercentage,
  updateInvoicePrefix,
  updateShopInfo,
} from "./settingApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const fetchSettingsThunk = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const result = extractData(await getSettings());
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load settings");
    }
  }
);

export const updateGstThunk = createAsyncThunk(
  "settings/updateGst",
  async (gstPercentage, { rejectWithValue }) => {
    try {
      return extractData(await updateGstConfig(gstPercentage));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update GST");
    }
  }
);

export const updateDiscountThunk = createAsyncThunk(
  "settings/updateDiscount",
  async (defaultDiscount, { rejectWithValue }) => {
    try {
      return extractData(await updateDiscountConfig(defaultDiscount));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update discount");
    }
  }
);

export const updateInvoicePrefixThunk = createAsyncThunk(
  "settings/updateInvoicePrefix",
  async (invoicePrefix, { rejectWithValue }) => {
    try {
      return extractData(await updateInvoicePrefix(invoicePrefix));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update invoice prefix");
    }
  }
);

export const updateShopInfoThunk = createAsyncThunk(
  "settings/updateShopInfo",
  async (shopData, { rejectWithValue }) => {
    try {
      return extractData(await updateShopInfo(shopData));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update shop info");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettingsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettingsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSettingsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateGstThunk.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateDiscountThunk.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateInvoicePrefixThunk.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateShopInfoThunk.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      });
  },
});

export default settingsSlice.reducer;