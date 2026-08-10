import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllUsers, createUser, updateUser, deleteUser ,changePassword} from "./userApi.js";

function extractList(response) {
  return response.data || response.result || response.Result || response;
}

export const fetchUsersThunk = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUsers();
      return extractList(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load staff");
    }
  }
);

export const addUserThunk = createAsyncThunk(
  "users/add",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await createUser(userData);
      return extractList(response);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create staff member");
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "users/update",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await updateUser(id, userData);
      return { id, updated: extractList(response) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update staff member");
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete staff member");
    }
  }
);
export const resetPasswordThunk = createAsyncThunk(
  "users/resetPassword",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await changePassword({ username, password });
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.Message || "Failed to reset password");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addUserThunk.fulfilled, (state, action) => {
        if (action.payload) state.list.push(action.payload);
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload.updated };
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;