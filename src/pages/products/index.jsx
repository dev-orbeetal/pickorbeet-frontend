import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X, ChevronDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';
import { fetchProducts } from '@/store/slices/productsSlice';

// Build query params object from filters, skipping empty values
function buildQuery(filters) {
  const query = {};
  if (filters.category.length > 0) query.category = filters.category.join(',');
  if (filters.size.length > 0) query.size = filters.size.join(',');
  if (filters.min_price) query.min_price = filters.min_price;
  if (filters.max_price) query.max_price = filters.max_price;
  if (filters.ordering && filters.ordering !== '-created_at') query.ordering = filters.ordering;
  return query;
}

// Parse URL query params into filters state
function parseQuery(query) {
  return {
    category: query.category ? query.category.split(',').filter(Boolean) : [],
    size: query.size ? query.size.split(',').filter(Boolean) : [],
    min_price: query.min_price || '',
    max_price: query.max_price || '',
    ordering: query.ordering || '-created_at',
  };
}

const defaultFilters = {
  category: [],
  size: [],
  min_price: '',
  max_price: '',
  ordering: '-created_at',
};

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { products, categories, loading, pagination } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [initialized, setInitialized] = useState(false);
  const priceTimerRef = useRef(null);

  // Categories are fetched globally in _app.jsx

  // Sync filters from URL on first load and on browser back/forward
  useEffect(() => {
    if (!router.isReady) return;
    const parsed = parseQuery(router.query);
    setFilters(parsed);
    // Dispatch fetch with the URL params directly
    const query = {};
    Object.entries(router.query).forEach(([k, v]) => { if (v) query[k] = v; });
    if (!query.ordering) query.ordering = '-created_at';
    dispatch(fetchProducts(query));
    setInitialized(true);
  }, [router.isReady, router.asPath, dispatch]);

  // Core: apply filters by dispatching fetch AND updating URL
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    const query = buildQuery(newFilters);
    // Always include ordering for consistent results
    const fetchParams = { ...query };
    if (!fetchParams.ordering) fetchParams.ordering = '-created_at';
    // Dispatch immediately — no reliance on router.query useEffect
    dispatch(fetchProducts(fetchParams));
    // Sync URL (shallow so page doesn't remount)
    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  }, [dispatch, router]);

  // Toggle a value in an array filter (category or size)
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      const newArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      const newFilters = { ...prev, [key]: newArr };
      applyFilters(newFilters);
      return newFilters;
    });
  }, [applyFilters]);

  // Set a scalar filter value
  const setScalarFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      applyFilters(newFilters);
      return newFilters;
    });
  }, [applyFilters]);

  // Debounced price filter — waits 600ms after user stops typing
  const handlePriceChange = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Debounce the actual fetch
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      priceTimerRef.current = setTimeout(() => {
        applyFilters(newFilters);
      }, 600);
      return newFilters;
    });
  }, [applyFilters]);

  const clearFilters = useCallback(() => {
    const cleared = { ...defaultFilters };
    setFilters(cleared);
    dispatch(fetchProducts({ ordering: '-created_at' }));
    router.push('/products', undefined, { shallow: true });
  }, [dispatch, router]);

  // Remove a single category from the active tags
  const removeCategory = useCallback((catId) => {
    const newCats = filters.category.filter((c) => c !== catId);
    applyFilters({ ...filters, category: newCats });
  }, [filters, applyFilters]);

  // Remove a single size from the active tags
  const removeSize = useCallback((size) => {
    const newSizes = filters.size.filter((s) => s !== size);
    applyFilters({ ...filters, size: newSizes });
  }, [filters, applyFilters]);

  const clearPriceFilter = useCallback(() => {
    applyFilters({ ...filters, min_price: '', max_price: '' });
  }, [filters, applyFilters]);

  const hasActiveFilters = filters.category.length > 0 || filters.size.length > 0 || filters.min_price || filters.max_price;
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];

  return (
    <Layout
      title="Shop All Products - Pickorbeet"
      description="Browse our complete collection of premium Borkha, Hijab, Abaya, Niqab and modest fashion. Filter by category, size, and price."
    >
      <div className="container-custom py-4 md:py-8">
        {/* Header */}
        <div className="mb-3 flex flex-col md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
              All Products
            </h1>
            <p className="text-secondary-600">
              {pagination.count} products found
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 btn btn-secondary"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <select
              value={filters.ordering}
              onChange={(e) => setScalarFilter('ordering', e.target.value)}
              className="input max-w-[200px]"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cream-200 bg-cream-50 p-3 md:mb-6 md:p-4">
            <span className="text-sm text-secondary-600 font-medium">Active Filters:</span>
            {filters.category.map((catId) => (
              <span key={catId} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {categories.find(c => c.id === catId)?.name || 'Category'}
                <button onClick={() => removeCategory(catId)} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.size.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Size: {s}
                <button onClick={() => removeSize(s)} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Price: ৳{filters.min_price || '0'} - ৳{filters.max_price || '∞'}
                <button onClick={clearPriceFilter} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-secondary-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter - Checkboxes for multi-select */}
              <div className="mb-6">
                <h4 className="font-medium text-secondary-800 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category.id)}
                        onChange={() => toggleArrayFilter('category', category.id)}
                        className="rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-secondary-700 group-hover:text-secondary-900">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-secondary-800 mb-3">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => handlePriceChange('min_price', e.target.value)}
                    className="input text-sm py-2"
                  />
                  <span className="text-secondary-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handlePriceChange('max_price', e.target.value)}
                    className="input text-sm py-2"
                  />
                </div>
              </div>

              {/* Size Filter - Multi-select toggle buttons */}
              <div className="mb-6">
                <h4 className="font-medium text-secondary-800 mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleArrayFilter('size', size)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filters.size.includes(size)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-700 border-gray-300 hover:border-primary-600'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading && products.length === 0 ? (
              <ProductGrid sidebar>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-cream-300" />
                    <div className="mt-2 h-4 bg-cream-300" />
                    <div className="mt-2 h-4 w-2/3 bg-cream-300" />
                  </div>
                ))}
              </ProductGrid>
            ) : products.length > 0 ? (
              <ProductGrid sidebar className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </ProductGrid>
            ) : (
              <div className="text-center py-16">
                <p className="text-secondary-600 text-lg">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
