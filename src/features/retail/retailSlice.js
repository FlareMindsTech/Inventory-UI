
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRetailInventorySummary,
  getRetailInventoryHistory,
  getLowStockProducts,
  receiveRetailStock,
  adjustRetailStock,
  updateRetailStock,
} from "./retailApi";

function extractData(response) {
  
  
  if (!response) {

    return [];
  }

  if (response.Result && Array.isArray(response.Result)) {
   
    return response.Result;
  }
  

  if (response.result && Array.isArray(response.result)) {
 
    return response.result;
  }
  

  if (response.data && Array.isArray(response.data)) {

    return response.data;
  }
  
  if (Array.isArray(response)) {
  
    return response;
  }
  
 
  if (response.items && Array.isArray(response.items)) {
 
    return response.items;
  }
  
 
  if (response.inventory && Array.isArray(response.inventory)) {
  
    return response.inventory;
  }
 
  if (response.id || response.productId || response.inventoryId) {
   
    return [response];
  }
  

  return [];
}


export const fetchRetailInventoryThunk = createAsyncThunk(
  "retail/fetchInventory",
  async (_, { rejectWithValue }) => {
    try {
  
      const response = await getRetailInventorySummary();
    
      
      const result = extractData(response);
  
      
      return result;
    } catch (err) {
     
      return rejectWithValue(err.response?.data?.Message || "Failed to load retail inventory");
    }
  }
);

export const fetchRetailHistoryThunk = createAsyncThunk(
  "retail/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRetailInventoryHistory();
      const result = extractData(response);
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load retail history");
    }
  }
);


export const fetchLowStockThunk = createAsyncThunk(
  "retail/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLowStockProducts();
      const result = extractData(response);
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to load low stock products");
    }
  }
);

export const receiveRetailStockThunk = createAsyncThunk(
  "retail/receiveStock",
  async ({ transferId }, { rejectWithValue }) => {
    try {
      const response = await receiveRetailStock({ transferId });
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to receive stock");
    }
  }
);


export const adjustRetailStockThunk = createAsyncThunk(
  "retail/adjustStock",
  async ({ productId, actualQuantity, reason }, { rejectWithValue }) => {
    try {
      const response = await adjustRetailStock({ productId, actualQuantity, reason });
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to adjust stock");
    }
  }
);


export const updateRetailStockThunk = createAsyncThunk(
  "retail/updateStock",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateRetailStock(id, data);
      return extractData(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to update stock");
    }
  }
);

const retailSlice = createSlice({
  name: "retail",
  initialState: {
    inventory: [],
    history: [],
    lowStock: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearRetailError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRetailInventoryThunk.pending, (state) => {
        state.status = "loading";
       
      })
      .addCase(fetchRetailInventoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.inventory = Array.isArray(action.payload) ? action.payload : [];
      
        if (state.inventory.length > 0) {
      
        }
      })
      .addCase(fetchRetailInventoryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        
      })
      .addCase(fetchRetailHistoryThunk.fulfilled, (state, action) => {
        state.history = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLowStockThunk.fulfilled, (state, action) => {
        state.lowStock = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(receiveRetailStockThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.inventory.findIndex(
            (item) => item.productId === action.payload.productId
          );
          if (idx !== -1) {
            state.inventory[idx] = { ...state.inventory[idx], ...action.payload };
          } else {
            state.inventory.unshift(action.payload);
          }
        
        }
      })
      .addCase(adjustRetailStockThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.inventory.findIndex(
            (item) => item.productId === action.payload.productId
          );
          if (idx !== -1) {
            state.inventory[idx] = { ...state.inventory[idx], ...action.payload };
          }
        }
      })
      .addCase(updateRetailStockThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.inventory.findIndex(
            (item) => item.id === action.payload.id
          );
          if (idx !== -1) {
            state.inventory[idx] = { ...state.inventory[idx], ...action.payload };
          }
        }
      });
  },
});

export const { clearRetailError } = retailSlice.actions;
export default retailSlice.reducer;