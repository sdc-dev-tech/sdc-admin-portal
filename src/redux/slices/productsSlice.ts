import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { Product } from "../../types";

interface ProductsState {
  items: Product[];
  allItems: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  currentPage: number | null;
  totalPages: number | null;
  totalProducts: number | null;
}

const initialState: ProductsState = {
  items: [],
  allItems: [],
  selectedProduct: null,
  loading: false,
  error: null,
  currentPage: null,
  totalPages: null,
  totalProducts: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page, limit } = params;

      let queryString = "/product";
      if (page !== undefined && limit !== undefined) {
        queryString += `?page=${page}&limit=${limit}`;
      }
      const response = await api.get(queryString);

      return {
        ...response.data,
        isPaginated: page !== undefined && limit !== undefined,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (
    {
      id,
      categoryId,
      subcategoryId,
    }: { id: string; categoryId: string; subcategoryId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/product/category/${categoryId}/subcategory/${subcategoryId}`
      );

      const products = response.data.products;

      const specificProduct = products.find(
        (product: any) => product._id === id
      );

      if (!specificProduct) {
        throw new Error(
          `Product with ID ${id} not found in this category/subcategory`
        );
      }

      return specificProduct;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (product: FormData | Omit<Product, "id">, { rejectWithValue }) => {
    try {
      const isFormData = product instanceof FormData;

      const response = await api.post("/product", product, {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      });

      // Backend returns { message: "Product created successfully", product }
      // Extract the product from the response
      return response.data.product || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (
    productData: { id: string; data: FormData | Partial<Product> },
    { rejectWithValue }
  ) => {
    try {
      const { id, data } = productData;

      if (!id || id === "undefined") {
        throw new Error("Product ID is required for update");
      }

      console.log("Updating product with ID:", id);
      console.log("Data type:", data instanceof FormData ? "FormData" : "JSON");

      if (data instanceof FormData) {
        console.log("FormData entries:");
        for (let [key, value] of data.entries()) {
          console.log(`${key}:`, value);
        }
      } else {
        console.log("JSON data:", data);
      }

      const isFormData = data instanceof FormData;

      const response = await api.put(`/product/${id}`, data, {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      });

      console.log("Update response:", response.data);

      return (
        response.data.updatedProduct || response.data.product || response.data
      );
    } catch (error: any) {
      console.error("Update product error:", error);
      console.error("Error response:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/product/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.isPaginated) {
          state.items = action.payload.products;
          state.currentPage = action.payload.currentPage;
          state.totalPages = action.payload.totalPages;
          state.totalProducts = action.payload.totalProducts;
        } else {
          state.allItems = action.payload.products || action.payload;
          if (!action.payload.products) {
            state.allItems = action.payload;
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Add the created product to both lists
        if (action.payload) {
          state.items.unshift(action.payload);
          state.allItems.unshift(action.payload);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          // Update in paginated items
          const paginatedIndex = state.items.findIndex(
            (item) => item._id === action.payload._id
          );
          if (paginatedIndex !== -1) {
            state.items[paginatedIndex] = action.payload;
          }

          // Update in all items
          const allItemsIndex = state.allItems.findIndex(
            (item) => item._id === action.payload._id
          );
          if (allItemsIndex !== -1) {
            state.allItems[allItemsIndex] = action.payload;
          }

          // Update selected product
          if (state.selectedProduct?._id === action.payload._id) {
            state.selectedProduct = action.payload;
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;

        state.items = state.items.filter((item) => item._id !== action.payload);
        state.allItems = state.allItems.filter(
          (item) => item._id !== action.payload
        );

        if (state.selectedProduct?._id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProduct, clearProductError, clearSelectedProduct } =
  productsSlice.actions;
export default productsSlice.reducer;
