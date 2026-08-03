import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  scanBarcode,
  addItemToBill,
  removeItemFromBill,
  updateItemQuantity,
  generateBill,
  processPayment,
} from "./billingApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const scanBarcodeThunk = createAsyncThunk(
  "billing/scanBarcode",
  async (barcode, { rejectWithValue }) => {
    try {
      return extractData(await scanBarcode(barcode));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Product not found for this barcode");
    }
  }
);

export const addItemToBillThunk = createAsyncThunk(
  "billing/addItem",
  async ({ productId, quantity, customerId }, { rejectWithValue }) => {
    try {
      const result = extractData(await addItemToBill({ productId, quantity, customerId }));
      return result; // { bill, items }
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to add item");
    }
  }
);

export const removeItemFromBillThunk = createAsyncThunk(
  "billing/removeItem",
  async (itemId, { rejectWithValue }) => {
    try {
      await removeItemFromBill(itemId);
      return itemId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to remove item");
    }
  }
);

export const updateItemQuantityThunk = createAsyncThunk(
  "billing/updateItemQuantity",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return extractData(await updateItemQuantity(itemId, quantity));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update quantity");
    }
  }
);

export const generateBillThunk = createAsyncThunk(
  "billing/generateBill",
  async (_, { rejectWithValue }) => {
    try {
      return extractData(await generateBill()); // { billId, billNumber, subtotal, gstAmount, grandTotal }
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to generate bill");
    }
  }
);

export const processPaymentThunk = createAsyncThunk(
  "billing/processPayment",
  async ({ billId, paymentMethod }, { rejectWithValue }) => {
    try {
      return extractData(await processPayment({ billId, paymentMethod }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to process payment");
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    scannedProduct: null,
    currentBill: null, // the running bill object, from addItemToBill's `bill`
    cartItems: [],
    generatedBill: null,
    paymentResult: null,
    customerId: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearScannedProduct: (state) => {
      state.scannedProduct = null;
    },
    setCustomerId: (state, action) => {
      state.customerId = action.payload;
    },
    clearBillingSession: (state) => {
      state.cartItems = [];
      state.currentBill = null;
      state.generatedBill = null;
      state.paymentResult = null;
      state.scannedProduct = null;
      state.customerId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanBarcodeThunk.fulfilled, (state, action) => {
        state.scannedProduct = action.payload;
      })
      .addCase(scanBarcodeThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.scannedProduct = null;
      })
      .addCase(addItemToBillThunk.pending, (state) => {
        state.status = "loading";
      })
    .addCase(addItemToBillThunk.fulfilled, (state, action) => {
    console.log("Redux Payload:", action.payload);

    state.status = "succeeded";
    state.currentBill = action.payload.bill;
    state.cartItems = action.payload.items || [];
})
      .addCase(addItemToBillThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(removeItemFromBillThunk.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(
          (item) => (item.itemId ?? item.id ?? item._id) !== action.payload
        );
      })
      .addCase(updateItemQuantityThunk.fulfilled, (state, action) => {
        if (action.payload?.items) {
          state.cartItems = action.payload.items;
        }
      })
      .addCase(generateBillThunk.fulfilled, (state, action) => {
        state.generatedBill = action.payload;
      })
      .addCase(processPaymentThunk.fulfilled, (state, action) => {
        state.paymentResult = action.payload;
        state.cartItems = [];
        state.currentBill = null;
        state.generatedBill = null;
        state.customerId = null;
      });
  },
});

export const { clearScannedProduct, setCustomerId, clearBillingSession } = billingSlice.actions;
export default billingSlice.reducer;