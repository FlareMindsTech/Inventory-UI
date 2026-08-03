import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFactoryInventorySummary,addProducedStock } from "./factoryInventoryApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const fetchFactoryInventoryThunk = createAsyncThunk(
  "factoryInventory/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const result = extractData(await getFactoryInventorySummary());
      return result.items || result.inventory || result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load factory inventory");
    }
  }
);

export const addProducedStockThunk = createAsyncThunk(
  "factoryInventory/addStock",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await addProducedStock({ productId, quantity });
      return response.Result || response.data || response.result || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to add stock");
    }
  }
);

const factoryInventorySlice = createSlice({
  name: "factoryInventory",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFactoryInventoryThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFactoryInventoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFactoryInventoryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addProducedStockThunk.fulfilled, (state, action) => {
  if (action.payload) state.list.push(action.payload);
});
      
  },
});

export default factoryInventorySlice.reducer;