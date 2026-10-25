import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '@/lib/api';

const initialState = {
  products: [],
  product: null,
  categories: [],
  featuredProducts: [],
  categoryProducts: [],
  loading: false,
  categoriesLoading: true,
  featuredLoading: true,
  categoryProductsLoading: true,
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

async function fetchProductPage(params) {
  const response = await productsAPI.getProducts(params);
  const data = response.data;
  // An exact category name comes back as one complete list. Other searches
  // are paged, so follow them until every match is loaded.
  if (!params?.search || Array.isArray(data) || !data?.results || !data.next) {
    return data;
  }
  const results = [...data.results];
  let next = data.next;
  let page = 2;
  while (next && page <= 50) {
    const more = await productsAPI.getProducts({ ...params, page });
    const body = more.data;
    const rows = Array.isArray(body) ? body : (body?.results || []);
    results.push(...rows);
    next = Array.isArray(body) ? null : body?.next;
    if (!rows.length) break;
    page += 1;
  }
  return { ...data, results, next: null, count: data.count || results.length };
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await fetchProductPage(params);
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
      .addCase(fetchCategories.pending, (state) => {
        if (state.categories.length === 0) {
          state.categoriesLoading = true;
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const categoriesData = action.payload.results || action.payload;
        state.categories = Array.isArray(categoriesData) ? categoriesData : [];
        state.categoriesLoading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const rows = Array.isArray(payload) ? payload : (payload?.results || []);
        state.products = Array.isArray(rows) ? rows : [];
        state.pagination = {
          count: Array.isArray(payload) ? rows.length : (payload?.count || rows.length),
          next: Array.isArray(payload) ? null : payload?.next,
          previous: Array.isArray(payload) ? null : payload?.previous,
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
      .addCase(fetchFeaturedProducts.pending, (state) => {
        if (state.featuredProducts.length === 0) {
          state.featuredLoading = true;
        }
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        const productsData = action.payload.results || action.payload;
        state.featuredProducts = Array.isArray(productsData) ? productsData : [];
        state.featuredLoading = false;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Fetch Products by Category
      .addCase(fetchProductsByCategory.pending, (state) => {
        if (state.categoryProducts.length === 0) {
          state.categoryProductsLoading = true;
        }
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const categoryData = action.payload.results || action.payload;
        state.categoryProducts = Array.isArray(categoryData) ? categoryData : [];
        state.categoryProductsLoading = false;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.categoryProductsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
