import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  scanBarcode,
  addItemToBill,
  removeItemFromBill,
  updateItemQuantity,
  generateBill,
  processPayment,
  startNewBill,
  getOpenBills,
  deleteOpenBill,
} from "./billingApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

function getBillId(bill) {
  return bill?.billId ?? bill?._id ?? bill?.id ?? null;
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
  async ({ billId, productId, quantity, customerId }, { rejectWithValue }) => {
    try {
      const result = extractData(await addItemToBill({ billId, productId, quantity, customerId }));
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
  async (billId, { rejectWithValue }) => {
    try {
      return extractData(await generateBill(billId)); // { billId, billNumber, subtotal, gstAmount, grandTotal }
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



export const startNewBillThunk = createAsyncThunk(
  "billing/startNewBill",
  async (customerId, { rejectWithValue }) => {
    try {
      const data = extractData(await startNewBill(customerId));
      return data?.bill ?? data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to start new bill");
    }
  }
);

export const fetchOpenBillsThunk = createAsyncThunk(
  "billing/fetchOpenBills",
  async (_, { rejectWithValue }) => {
    try {
      const data = extractData(await getOpenBills());
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.bills)) list = data.bills;
      else if (Array.isArray(data?.data)) list = data.data;

      return list.map((entry) =>
        entry?.bill ? { ...entry.bill, items: entry.items ?? [] } : entry
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load waiting queue");
    }
  }
);

export const deleteOpenBillThunk = createAsyncThunk(
  "billing/deleteOpenBill",
  async (billId, { rejectWithValue }) => {
    try {
      await deleteOpenBill(billId);
      return billId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to discard bill");
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    scannedProduct: null,
    currentBill: null, 
    cartItems: [],
    generatedBill: null,
    paymentResult: null,
    customerId: null,

    activeBillId: null,
    openBills: [], 

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
      state.activeBillId = null;
    },
    
    switchActiveBill: (state, action) => {
      const billId = action.payload;
      const bill = state.openBills.find((b) => getBillId(b) === billId);
      state.activeBillId = billId;
      state.currentBill = bill ?? null;
      state.cartItems = bill?.items ?? [];
      state.customerId = bill?.customerId ?? null;
      state.generatedBill = null; 
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
        state.status = "succeeded";
        state.currentBill = action.payload.bill;
        state.cartItems = action.payload.items || [];
        state.activeBillId = getBillId(action.payload.bill) ?? state.activeBillId;


        const billId = getBillId(action.payload.bill);
        const idx = state.openBills.findIndex((b) => getBillId(b) === billId);
        if (idx !== -1) {
          state.openBills[idx] = { ...state.openBills[idx], ...action.payload.bill, items: state.cartItems };
        }
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
        const paidBillId = action.meta.arg.billId;

        state.paymentResult = action.payload;
        state.openBills = state.openBills.filter((b) => getBillId(b) !== paidBillId);

        if (state.activeBillId === paidBillId) {
        
          const next = state.openBills[0];
          if (next) {
            state.activeBillId = getBillId(next);
            state.currentBill = next;
            state.cartItems = next.items ?? [];
            state.customerId = next.customerId ?? null;
          } else {
            state.cartItems = [];
            state.currentBill = null;
            state.customerId = null;
            state.activeBillId = null;
          }
        }
        state.generatedBill = null;
      })

      .addCase(startNewBillThunk.fulfilled, (state, action) => {
        const bill = action.payload;
        state.openBills.push(bill);
        state.activeBillId = getBillId(bill);
        state.currentBill = bill;
        state.cartItems = bill.items ?? [];
        state.generatedBill = null;
      })
      .addCase(fetchOpenBillsThunk.fulfilled, (state, action) => {
        state.openBills = action.payload;

        if (!state.activeBillId && action.payload.length > 0) {
          const first = action.payload[0];
          state.activeBillId = getBillId(first);
          state.currentBill = first;
          state.cartItems = first.items ?? [];
          state.customerId = first.customerId ?? null;
        }
      })
      .addCase(deleteOpenBillThunk.fulfilled, (state, action) => {
        const billId = action.payload;
        state.openBills = state.openBills.filter((b) => getBillId(b) !== billId);
        if (state.activeBillId === billId) {
          const next = state.openBills[0];
          state.activeBillId = next ? getBillId(next) : null;
          state.currentBill = next ?? null;
          state.cartItems = next?.items ?? [];
          state.customerId = next?.customerId ?? null;
          state.generatedBill = null;
        }
      });
  },
});

export const { clearScannedProduct, setCustomerId, clearBillingSession, switchActiveBill } =
  billingSlice.actions;
export default billingSlice.reducer;