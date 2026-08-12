import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInvoices,
  generateInvoice,
  getInvoiceById,
  downloadInvoicePdf,
  cancelInvoice,
} from "./invoiceApi";

const extractData = (response) =>
  response?.Result || response?.data || response?.result || response;


export const fetchInvoicesThunk = createAsyncThunk(
  "invoice/fetchAll",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return extractData(await getInvoices(page, limit));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to fetch invoices"
      );
    }
  }
);


export const generateInvoiceThunk = createAsyncThunk(
  "invoice/generate",
  async (billId, { rejectWithValue }) => {
    try {
      return extractData(await generateInvoice(billId));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to generate invoice"
      );
    }
  }
);


export const fetchInvoiceByIdThunk = createAsyncThunk(
  "invoice/getById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      return extractData(await getInvoiceById(invoiceId));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to fetch invoice"
      );
    }
  }
);


export const downloadInvoicePdfThunk = createAsyncThunk(
  "invoice/downloadPdf",
  async (invoiceId, { rejectWithValue }) => {
    try {
      return await downloadInvoicePdf(invoiceId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to download invoice"
      );
    }
  }
);


export const cancelInvoiceThunk = createAsyncThunk(
  "invoice/cancel",
  async ({ invoiceId, reason }, { rejectWithValue }) => {
    try {
      return extractData(await cancelInvoice(invoiceId, reason));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.Message || "Failed to cancel invoice"
      );
    }
  }
);

const initialState = {
  invoices: [],
  selectedInvoice: null,
  generatedInvoice: null,
  pdfBlob: null,

  status: "idle",
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearSelectedInvoice(state) {
      state.selectedInvoice = null;
    },

    clearGeneratedInvoice(state) {
      state.generatedInvoice = null;
    },

    clearInvoicePdf(state) {
      state.pdfBlob = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchInvoicesThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchInvoicesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoices = action.payload?.invoices || action.payload || [];
      })

      .addCase(fetchInvoicesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(generateInvoiceThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(generateInvoiceThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.generatedInvoice = action.payload;
      })

      .addCase(generateInvoiceThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

     
      .addCase(fetchInvoiceByIdThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchInvoiceByIdThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedInvoice = action.payload;
      })

      .addCase(fetchInvoiceByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

  
      .addCase(downloadInvoicePdfThunk.fulfilled, (state, action) => {
        state.pdfBlob = action.payload.data;
      })

     
      .addCase(cancelInvoiceThunk.pending, (state) => {
        state.status = "loading";
      })

      .addCase(cancelInvoiceThunk.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.selectedInvoice = action.payload;

        state.invoices = state.invoices.map((invoice) =>
          invoice.invoiceId === action.payload.invoiceId
            ? action.payload
            : invoice
        );
      })

      .addCase(cancelInvoiceThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedInvoice,
  clearGeneratedInvoice,
  clearInvoicePdf,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;