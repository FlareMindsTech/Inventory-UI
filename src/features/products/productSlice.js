import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProducts,
  addProduct as addProductAPI,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
  getAllCategories,
  getAllBrands,
} from "./productApi";

function extractData(response) {
  return response.Result || response.data || response.result || response;
}

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllProducts();
    
      const result = extractData(response);
      const products = Array.isArray(result) ? result : (result.products || result.data || []);
      return products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.Message || "Failed to load products");
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = extractData(await getAllCategories());
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load categories");
    }
  }
);

export const fetchBrandsThunk = createAsyncThunk(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const data = extractData(await getAllBrands());
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load brands");
    }
  }
);

export const addProductThunk = createAsyncThunk(
  "products/add",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await addProductAPI(productData);
   
      const result = response.data || response.Result || response;
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.Message || "Failed to add product");
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await updateProductAPI(id, productData);
      const updated = extractData(response);
      return { id, updated };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update product");
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProductAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    categories: [],
    brands: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBrandsThunk.fulfilled, (state, action) => {
        state.brands = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.productId === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...action.payload.updated };
        }
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.productId !== action.payload);
      });
  },
});

export default productSlice.reducer;