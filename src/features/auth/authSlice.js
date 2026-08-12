import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, getProfile, logoutUser } from "./authApi";

function extractToken(response) {
  return (
    response.token ||
    response.accessToken ||
    response.access_token ||
    response.data?.token ||
    response.data?.accessToken ||
    response.result?.token ||
    response.Result?.token
  );
}

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ userName, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await loginUser({ userName, password });
    
      const token = extractToken(response);

      if (!token) {
        
        return rejectWithValue("Login succeeded but no token was returned.");
      }

      localStorage.setItem("token", token);

    return {
  token,
  user: response.Result?.user || response.result?.user || null,
};
    } catch (err) {
     
      return rejectWithValue(
        err.response?.data?.message || "Invalid username or password"
      );
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfile();
   
      return data.data || data.result || data.Result || data;
    } catch (err) {
      
      return rejectWithValue(err.response?.data?.message || "Failed to load profile");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutUser();
  } catch {
    
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export default authSlice.reducer;