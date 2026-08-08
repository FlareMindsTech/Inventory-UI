import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInvoiceByNumber,
  searchProductsForExchange,
  createExchange,
  getExchangeHistory,
  settleExchange,
} from "./exchangeApi";

const initialState = {
  // step 1: invoice lookup
  invoice: null,
  invoiceItems: [],

  // step 2/3: product selection
  selectedOldProduct: null,
  productResults: [],
  selectedNewProduct: null,

  // result of a completed exchange
  lastExchange: null,

  // history list
  history: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  statusFilter: "",

  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// ----- Thunks -----

export const fetchInvoiceThunk = createAsyncThunk(
  "exchange/fetchInvoice",
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const data = await getInvoiceByNumber(invoiceNumber);
      return data?.Result ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || err.response?.data?.message || "Invoice not found"
      );
    }
  }
);

export const searchProductsThunk = createAsyncThunk(
  "exchange/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const data = await searchProductsForExchange(query);
      return data?.Result ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || err.response?.data?.message || "Product search failed"
      );
    }
  }
);

export const createExchangeThunk = createAsyncThunk(
  "exchange/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createExchange(payload);
      return data?.Result ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || err.response?.data?.message || "Failed to create exchange"
      );
    }
  }
);

export const fetchExchangeHistoryThunk = createAsyncThunk(
  "exchange/fetchHistory",
  async (params, { rejectWithValue }) => {
    try {
      const data = await getExchangeHistory(params);
      return data?.Result ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || err.response?.data?.message || "Failed to load exchange history"
      );
    }
  }
);

export const settleExchangeThunk = createAsyncThunk(
  "exchange/settle",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await settleExchange(payload);
      return data?.Result ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || err.response?.data?.message || "Failed to settle exchange"
      );
    }
  }
);

// ----- Slice -----

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
    setOldProduct: (state, action) => {
      state.selectedOldProduct = action.payload;
    },
    setNewProduct: (state, action) => {
      state.selectedNewProduct = action.payload;
    },
    clearProductResults: (state) => {
      state.productResults = [];
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    resetExchangeForm: (state) => {
      state.invoice = null;
      state.invoiceItems = [];
      state.selectedOldProduct = null;
      state.selectedNewProduct = null;
      state.productResults = [];
      state.lastExchange = null;
      state.error = null;
    },
    clearExchangeSession: () => initialState,
  },
  extraReducers: (builder) => {
    const toArray = (val) => {
      if (Array.isArray(val)) return val;
      if (Array.isArray(val?.history)) return val.history;
      if (Array.isArray(val?.data)) return val.data;
      if (Array.isArray(val?.items)) return val.items;
      if (Array.isArray(val?.Result)) return val.Result;
      if (Array.isArray(val?.Data)) return val.Data;
      return [];
    };

    builder
      // invoice lookup
      .addCase(fetchInvoiceThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInvoiceThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const result = action.payload || {};
        state.invoice = result;
        state.invoiceItems = toArray(result.productList ?? result.items ?? result);
      })
      .addCase(fetchInvoiceThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.invoice = null;
        state.invoiceItems = [];
      })

      // product search (for the replacement/new product)
      .addCase(searchProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchProductsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productResults = toArray(action.payload);
      })
      .addCase(searchProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.productResults = [];
      })

      // create exchange
      .addCase(createExchangeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createExchangeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastExchange = action.payload;
        if (Array.isArray(state.history)) {
          state.history.unshift(action.payload);
        }
      })
      .addCase(createExchangeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // history
      .addCase(fetchExchangeHistoryThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExchangeHistoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const result = action.payload || {};
        const list = toArray(result);
        state.history = list;
        state.pagination = {
          page: result.page ?? result.Page ?? state.pagination.page,
          limit: result.limit ?? result.Limit ?? state.pagination.limit,
          total: result.total ?? result.Total ?? list.length,
          totalPages: result.totalPages ?? result.TotalPages ?? 1,
        };
      })
      .addCase(fetchExchangeHistoryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // settle
      .addCase(settleExchangeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(settleExchangeThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(settleExchangeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setOldProduct,
  setNewProduct,
  clearProductResults,
  setStatusFilter,
  setPage,
  resetExchangeForm,
  clearExchangeSession,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;