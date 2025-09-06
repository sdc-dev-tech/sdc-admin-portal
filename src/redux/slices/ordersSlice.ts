import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { Order } from "../../types";

interface OrdersState {
  product: [];
  items: Order[];
  allItems: Order[]; // For search/filter mode
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalOrders: number;
  currentPage: number;
}

const initialState: OrdersState = {
  product: [],
  loading: false,
  error: null,
  items: [],
  allItems: [],
  selectedOrder: null,
  totalPages: 1,
  totalOrders: 0,
  currentPage: 1,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const url = `/order/all${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      return {
        orders: response.data.orders,
        totalPages: response.data.totalPages,
        totalOrders: response.data.totalOrders,
        currentPage: response.data.currentPage,
        isPaginated: params.page !== undefined || params.limit !== undefined,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/order/admin-status/${id}`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

export const uploadInvoiceWithQuantities = createAsyncThunk(
  "orders/uploadInvoiceWithQuantities",
  async (
    {
      orderId,
      formData,
    }: {
      orderId: string;
      formData: {
        invoice: File | null;
        availableQuantities: { [key: string]: number };
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const uploadFormData = new FormData();

      if (formData.invoice) {
        uploadFormData.append("invoice", formData.invoice);
      }

      uploadFormData.append(
        "availableQuantities",
        JSON.stringify(formData.availableQuantities)
      );

      const response = await api.post(
        `/order/upload-invoice/${orderId}`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to upload invoice with quantities"
      );
    }
  }
);

export const updateOrderItem = createAsyncThunk(
  "orders/updateOrderItem",
  async (
    {
      orderId,
      itemId,
      updates,
    }: {
      orderId: string;
      itemId: string;
      updates: { name?: string; quantity?: number; variant?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/order/${orderId}/item/${itemId}`,
        updates
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order item"
      );
    }
  }
);

export const sendToWarehouse = createAsyncThunk(
  "orders/sendToWarehouse",
  async ({ orderId, items }: { orderId: string; items: any[] }) => {
    try {
      const response = await api.patch(
        `/order/send-warehouse/${orderId}`,
        { items },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("first", response);

      return response.data;
    } catch (error) {
      console.error("Send to warehouse error:", error);
      throw error;
    }
  }
);

// Admin Stock Review
export const handleAdminReview = createAsyncThunk(
  "orders/handleAdminReview",
  async ({
    orderId,
    availableQuantities,
  }: {
    orderId: string;
    availableQuantities: Record<string, number>;
  }) => {
    try {
      const response = await api.patch(
        `/order/warehouse-processed/${orderId}`,
        { availableQuantities },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Admin stock review error:", error);
      throw error;
    }
  }
);
export const handleStockReview = createAsyncThunk(
  "orders/handleStockReview",
  async ({
    orderId,
    availableQuantities,
  }: {
    orderId: string;
    availableQuantities: Record<string, number>;
  }) => {
    try {
      const response = await api.patch(
        `/order/admin-stock-review/${orderId}`,
        { availableQuantities },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Admin stock review error:", error);
      throw error;
    }
  }
);

export const uploadInvoiceByManager = createAsyncThunk(
  "orders/uploadInvoiceByManager",
  async (
    { orderId, file }: { orderId: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("invoice", file);

      const response = await api.post(
        `order/upload-invoice-manager/${orderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data; // must contain updated order object
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Upload failed");
    }
  }
);
export const handleReviewInvoice = createAsyncThunk(
  "orders/reviewInvoice",
  async (
    {
      orderId,
      decision,
      reason,
    }: { orderId: string; decision: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `order/review-invoice/${orderId}`,
        { decision, reason },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // backend returns { message, orderId, backorderId? }
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Invoice review failed");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${productId}`);
      console.log("Product fetched successfully:", response.data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch product");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const { orders, totalPages, totalOrders, currentPage, isPaginated } =
          action.payload;

        if (isPaginated) {
          // Paginated mode - update items
          state.items = orders;
        } else {
          // All items mode - update allItems
          state.allItems = orders;
        }

        state.totalPages = totalPages;
        state.totalOrders = totalOrders;
        state.currentPage = currentPage;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status } = action.payload;

        // Update in items array
        const itemIndex = state.items.findIndex((order) => order._id === id);
        if (itemIndex !== -1) {
          state.items[itemIndex].status = status;
        }

        // Update in allItems array
        const allItemIndex = state.allItems.findIndex(
          (order) => order._id === id
        );
        if (allItemIndex !== -1) {
          state.allItems[allItemIndex].status = status;
        }

        // Update selected order
        if (state.selectedOrder && state.selectedOrder._id === id) {
          state.selectedOrder.status = status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadInvoiceWithQuantities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadInvoiceWithQuantities.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedOrder) {
          state.selectedOrder = { ...state.selectedOrder, ...action.payload };
        }
      })
      .addCase(uploadInvoiceWithQuantities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload;

        // Update in selectedOrder
        if (state.selectedOrder) {
          const itemIndex = state.selectedOrder.items.findIndex(
            (item) => item._id === updatedItem._id
          );
          if (itemIndex !== -1) {
            // Update the item in selectedOrder
            state.selectedOrder.items[itemIndex] = {
              ...state.selectedOrder.items[itemIndex],
              ...updatedItem,
            };
          }
        }

        // Update in items array (paginated orders)
        const orderIndex = state.items.findIndex((order) =>
          order.items.some((item) => item._id === updatedItem._id)
        );
        if (orderIndex !== -1) {
          const itemIndex = state.items[orderIndex].items.findIndex(
            (item) => item._id === updatedItem._id
          );
          if (itemIndex !== -1) {
            state.items[orderIndex].items[itemIndex] = {
              ...state.items[orderIndex].items[itemIndex],
              ...updatedItem,
            };
          }
        }

        // Update in allItems array (all orders)
        const allOrderIndex = state.allItems.findIndex((order) =>
          order.items.some((item) => item._id === updatedItem._id)
        );
        if (allOrderIndex !== -1) {
          const itemIndex = state.allItems[allOrderIndex].items.findIndex(
            (item) => item._id === updatedItem._id
          );
          if (itemIndex !== -1) {
            state.allItems[allOrderIndex].items[itemIndex] = {
              ...state.allItems[allOrderIndex].items[itemIndex],
              ...updatedItem,
            };
          }
        }
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendToWarehouse.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendToWarehouse.fulfilled, (state) => {
        state.loading = false;
        // Update the order if needed
        if (state.selectedOrder) {
          state.selectedOrder.status = "Warehouse Processing"; // or whatever status your API returns
        }
      })
      .addCase(sendToWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send to warehouse";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleAdminReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleAdminReview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order; // just update the selected order
      })

      .addCase(handleAdminReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleStockReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleStockReview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order; // just update the selected order
      })

      .addCase(handleStockReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadInvoiceByManager.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadInvoiceByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order; // server must send updated order here
      })
      .addCase(uploadInvoiceByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleReviewInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(handleReviewInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.order || state.selectedOrder;
        // if API only returns { message, orderId } keep existing selectedOrder
      })
      .addCase(handleReviewInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedOrder, clearOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;
