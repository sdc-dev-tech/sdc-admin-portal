import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { Category } from "../../types";

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      // return mockCategories;
      const response = await api.get(`/category`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.category;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/category/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.updatedCategory;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      await api.delete(`/category/${id}`);

      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const createSubcategory = createAsyncThunk(
  "categories/createSubcategory",
  async (
    {
      categoryId,
      formData,
    }: {
      categoryId: string;
      formData: FormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/subcategory`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        categoryId,
        subcategory: response.data.subcategory,
      };
    } catch (error: any) {
      console.log(error.response);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subcategory"
      );
    }
  }
);

// write a code for update subcategory
export const updateSubcategory = createAsyncThunk(
  "categories/updateSubcategory",
  async (
    {
      categoryId,
      subcategoryId,
      formData,
    }: {
      categoryId: string;
      subcategoryId: string;
      formData: FormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/subcategory/${subcategoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        categoryId,
        subcategory: response.data.updatedSubcategory,
      };
    } catch (error: any) {
      console.log(error.response);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subcategory"
      );
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "categories/deleteSubcategory",
  async (
    {
      categoryId,
      subcategoryId,
    }: { categoryId: string; subcategoryId: string },
    { rejectWithValue }
  ) => {
    try {
      // In a real app, this would be an API call
      await api.delete(`/subcategory/${subcategoryId}`);

      return { categoryId, subcategoryId };
    } catch (error: any) {
      console.log(error.response.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, subcategory } = action.payload;
        const categoryIndex = state.items.findIndex(
          (item) => item._id === categoryId
        );
        if (categoryIndex !== -1) {
          if (!state.items[categoryIndex].subcategories) {
            state.items[categoryIndex].subcategories = [];
          }
          state.items[categoryIndex].subcategories.push(subcategory);
        }
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, subcategoryId } = action.payload;
        const categoryIndex = state.items.findIndex(
          (item) => item._id === categoryId
        );
        if (categoryIndex !== -1 && state.items[categoryIndex].subcategories) {
          state.items[categoryIndex].subcategories = state.items[
            categoryIndex
          ].subcategories.filter(
            (subcategory) => subcategory.id !== subcategoryId
          );
        }
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
