import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateBarcode, validateBarcode, getBarcodeDetails } from "./barcodeApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const generateBarcodeThunk = createAsyncThunk(
  "barcodes/generate",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await generateBarcode(productId);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to generate barcode");
    }
  }
);

export const validateBarcodeThunk = createAsyncThunk(
  "barcodes/validate",
  async (barcode, { rejectWithValue }) => {
    try {
      const response = await validateBarcode(barcode);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Invalid barcode");
    }
  }
);

export const fetchBarcodeDetailsThunk = createAsyncThunk(
  "barcodes/fetchDetails",
  async (barcode, { rejectWithValue }) => {
    try {
      const response = await getBarcodeDetails(barcode);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Barcode not found");
    }
  }
);

const barcodeSlice = createSlice({
  name: "barcodes",
  initialState: {
    lastGenerated: null,
    lookupResult: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearLookupResult: (state) => {
      state.lookupResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateBarcodeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generateBarcodeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastGenerated = action.payload;
      })
      .addCase(generateBarcodeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(validateBarcodeThunk.fulfilled, (state, action) => {
        state.lookupResult = action.payload;
      })
      .addCase(fetchBarcodeDetailsThunk.fulfilled, (state, action) => {
        state.lookupResult = action.payload;
      })
      .addCase(fetchBarcodeDetailsThunk.rejected, (state, action) => {
        state.lookupResult = null;
        state.error = action.payload;
      });
  },
});

export const { clearLookupResult } = barcodeSlice.actions;
export default barcodeSlice.reducer;