import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '@/lib/api';

const initialState = {
  products: [],
  product: null,
  categories: [],
  featuredProducts: [],
  categoryProducts: [],
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProduct(slug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch product');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch featured products');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getProductsByCategory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch products by category');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        // Handle paginated response - extract results if present
        const categoriesData = action.payload.results || action.payload;
        state.categories = Array.isArray(categoriesData) ? categoriesData : [];
      })
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.results || action.payload;
        state.pagination = {
          count: action.payload.count || 0,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Product
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        // Handle paginated response - extract results if present
        const productsData = action.payload.results || action.payload;
        state.featuredProducts = Array.isArray(productsData) ? productsData : [];
      })
      // Fetch Products by Category
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        // Handle paginated response - extract results if present
        const categoryData = action.payload.results || action.payload;
        state.categoryProducts = Array.isArray(categoryData) ? categoryData : [];
      });
  },
});

export const { clearProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
