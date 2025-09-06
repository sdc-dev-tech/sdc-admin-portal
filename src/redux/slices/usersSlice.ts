import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { User } from "../../types";

interface UsersState {
  items: User[]; // Holds paginated users for normal Browse
  allUsers: User[]; // Holds ALL users fetched for frontend search/filter
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: UsersState = {
  items: [], // Initial load from mock, will be replaced by API
  allUsers: [], // Initialize empty for the full list
  selectedUser: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// --- MODIFIED fetchUsers THUNK ---
// This thunk will fetch either paginated users or all users based on `fetchPaginated` flag.
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    {
      page,
      limit,
      fetchPaginated = true,
    }: { page?: number; limit?: number; fetchPaginated?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const params: { page?: number; limit?: number } = {};
      if (fetchPaginated) {
        params.page = page || 1;
        params.limit = limit || 10;
      }
      // If `fetchPaginated` is false, `params` will be empty, leading to fetch all
      const response = await api.get("/admin/users", { params });

      // Return response along with the `fetchPaginated` flag for the reducer
      return { ...response.data, fetchPaginated };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// --- REMOVE searchUsers THUNK entirely, search will be client-side ---

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/users/${id}`);

      return id; // Return the ID so the fulfilled reducer can filter it out
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    // No specific `filterUsers` synchronous action needed anymore,
    // as filtering will be done directly in the component using `useSelector`
  },
  extraReducers: (builder) => {
    builder
      // Handle fetching users (either paginated or all)
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        // Check the `fetchPaginated` flag from the action payload
        if (action.payload.fetchPaginated) {
          // This was a paginated request
          state.items = action.payload.users;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          // When paginated, clear allUsers as it's not the full list
          state.allUsers = [];
        } else {
          // This was a request for ALL users (for search/filter)
          // The API response for all users might still have { users: [], totalUsers: N }
          state.allUsers = action.payload.users || action.payload; // Handle cases where it's just an array of users
          // Reset pagination info when all users are fetched
          state.items = []; // `items` should be empty or set by a separate pagination logic on `allUsers` if needed.
          // For simplicity, we'll just use `allUsers` directly for search.
          state.currentPage = 1;
          state.totalPages = 1;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = [];
        state.allUsers = []; // Clear allUsers on error too
      })

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from both paginated items and allUsers
        state.items = state.items.filter((user) => user._id !== action.payload);
        state.allUsers = state.allUsers.filter(
          (user) => user._id !== action.payload
        );
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedUser, clearUserError } = usersSlice.actions;
export default usersSlice.reducer;
