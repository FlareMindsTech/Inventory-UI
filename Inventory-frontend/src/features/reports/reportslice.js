import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportsAPI } from "./reportApi";



const extractResult = (res) => {
  const payload = res?.data;
  return payload?.Result ?? payload?.result ?? payload?.data ?? payload ?? null;
};

const extractError = (err) =>
  err?.response?.data?.Message ||
  err?.response?.data?.message ||
  err?.message ||
  "Something went wrong";

const makeThunk = (name, apiCall) =>
  createAsyncThunk(`reports/${name}`, async (params, { rejectWithValue }) => {
    try {
      const res = await apiCall(params);
      return extractResult(res);
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  });

/* ---------- thunks, one per endpoint ---------- */
export const fetchDashboardSummary = makeThunk("dashboard", () =>
  reportsAPI.getDashboardSummary()
);
export const fetchSalesReport = makeThunk("sales", (p) =>
  reportsAPI.getSalesReport(p?.startDate, p?.endDate)
);
export const fetchInventoryReport = makeThunk("inventory", () =>
  reportsAPI.getInventoryReport()
);
export const fetchFactoryInventoryReport = makeThunk("factoryInventory", () =>
  reportsAPI.getFactoryInventoryReport()
);
export const fetchRetailInventoryReport = makeThunk("retailInventory", () =>
  reportsAPI.getRetailInventoryReport()
);
export const fetchStockTransferReport = makeThunk("stockTransfer", (p) =>
  reportsAPI.getStockTransferReport(p?.startDate, p?.endDate)
);
export const fetchGstReport = makeThunk("gst", (p) =>
  reportsAPI.getGstReport(p?.startDate, p?.endDate)
);
export const fetchProfitReport = makeThunk("profit", (p) =>
  reportsAPI.getProfitReport(p?.startDate, p?.endDate)
);
export const fetchLowStockReport = makeThunk("lowStock", () =>
  reportsAPI.getLowStockReport()
);
export const fetchBestSellingReport = makeThunk("bestSelling", (p) =>
  reportsAPI.getBestSellingReport(p?.startDate, p?.endDate)
);


export const fetchStaffSales = makeThunk("staffSales", (p) =>
  reportsAPI.getSalesByStaff(p?.staffId)
);

/* ---------- state ---------- */
const emptySection = { data: null, loading: false, error: null };

const initialState = {
  dashboard: { ...emptySection },
  sales: { ...emptySection },
  inventory: { ...emptySection },
  factoryInventory: { ...emptySection },
  retailInventory: { ...emptySection },
  stockTransfer: { ...emptySection },
  gst: { ...emptySection },
  profit: { ...emptySection },
  lowStock: { ...emptySection },
  bestSelling: { ...emptySection },
  staffSales: { ...emptySection }
};

const thunkToKey = [
  [fetchDashboardSummary, "dashboard"],
  [fetchSalesReport, "sales"],
  [fetchInventoryReport, "inventory"],
  [fetchFactoryInventoryReport, "factoryInventory"],
  [fetchRetailInventoryReport, "retailInventory"],
  [fetchStockTransferReport, "stockTransfer"],
  [fetchGstReport, "gst"],
  [fetchProfitReport, "profit"],
  [fetchLowStockReport, "lowStock"],
  [fetchBestSellingReport, "bestSelling"],
  [fetchStaffSales, "staffSales"]
];

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    resetReports: () => initialState
  },
  extraReducers: (builder) => {
    thunkToKey.forEach(([thunk, key]) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[key].loading = true;
          state[key].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[key].loading = false;
          state[key].data = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state[key].loading = false;
          state[key].error = action.payload;
        });
    });
  }
});

export const { resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;