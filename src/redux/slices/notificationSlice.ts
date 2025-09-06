import { api } from "@/services/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type Notification = {
  _id: string;
  message: string;
  order: string;
  createdAt: string;
};

interface NotificationState {
  items: Notification[];
  loading: boolean;
  error: string | null;
  length: number; // ✅ Add length to state
}

const initialState: NotificationState = {
  items: [],
  loading: false,
  error: null,
  length: 0, // ✅ Initialize
};

// 👉 GET all notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notification`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 👉 GET notification count
export const fetchNotificationsLength = createAsyncThunk(
  "notifications/fetchLength",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notification`);
      return response.data.length; // ✅ just return length
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 👉 DELETE a notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notification/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.length = action.payload.length; // ✅ set length from fetched data
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // DELETE
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
        state.length = state.items.length; // ✅ update length after delete
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // FETCH LENGTH
      .addCase(fetchNotificationsLength.fulfilled, (state, action) => {
        state.length = action.payload;
      })
      .addCase(fetchNotificationsLength.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default notificationSlice.reducer;

// ✅ Selector to get notification count
export const selectNotificationCount = (state: { notifications: NotificationState }) =>
  state.notifications.length;
