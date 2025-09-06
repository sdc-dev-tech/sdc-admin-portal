import { api } from "@/services/api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null; // timestamp in ms
  loading: boolean;
  error: string | null;
}

// --- Helpers ---
const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

const isTokenExpired = (expiration: number | null): boolean => {
  if (!expiration) return true;
  return Date.now() >= expiration;
};

// --- Initial State ---
const initialState: AuthState = {
  isAuthenticated: localStorage.getItem("token")
    ? !isTokenExpired(Number(localStorage.getItem("tokenExpiration")))
    : false,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  tokenExpiration: localStorage.getItem("tokenExpiration")
    ? Number(localStorage.getItem("tokenExpiration"))
    : null,
  loading: false,
  error: null,
};

// --- Thunks ---
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data; // { accessToken, refreshToken, user }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await api.post("/auth/refresh-token", { refreshToken });
      return response.data; // { accessToken }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Refresh failed");
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiration");
    },
    clearError: (state) => {
      state.error = null;
    },
    checkTokenValidity: (state) => {
      if (state.tokenExpiration && isTokenExpired(state.tokenExpiration)) {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiration = null;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiration");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Login ---
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (
          state,
          action: PayloadAction<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>
        ) => {
          const tokenExpiration = getTokenExpiration(
            action.payload.accessToken
          );

          state.isAuthenticated = true;
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.tokenExpiration = tokenExpiration;

          localStorage.setItem("token", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          if (tokenExpiration) {
            localStorage.setItem("tokenExpiration", tokenExpiration.toString());
          }
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Refresh ---
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const tokenExpiration = getTokenExpiration(action.payload.accessToken);
        state.token = action.payload.accessToken;
        state.tokenExpiration = tokenExpiration;

        localStorage.setItem("token", action.payload.accessToken);
        if (tokenExpiration) {
          localStorage.setItem("tokenExpiration", tokenExpiration.toString());
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // if refresh failed → logout
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiration = null;
        localStorage.clear();
      });
  },
});

export const { logout, clearError, checkTokenValidity } = authSlice.actions;
export default authSlice.reducer;
