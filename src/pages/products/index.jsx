import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts, fetchCategories } from '@/store/slices/productsSlice';

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { products, categories, loading, pagination } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    size: '',
    ordering: '-created_at',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = { ...router.query };
    dispatch(fetchProducts(params));
  }, [dispatch, router.query]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const query = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) query[k] = v;
    });

    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      size: '',
      ordering: '-created_at',
    });
    router.push('/products');
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];

  return (
    <Layout title="Shop All Products - Zzuhana">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
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
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
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
        {(filters.category || filters.min_price || filters.max_price || filters.size) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-cream-50 rounded-xl border border-cream-200">
            <span className="text-sm text-secondary-600 font-medium">Active Filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {categories.find(c => c.id === filters.category)?.name || 'Category'}
                <button onClick={() => handleFilterChange('category', '')} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Size: {filters.size}
                <button onClick={() => handleFilterChange('size', '')} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Price: ৳{filters.min_price || '0'} - ৳{filters.max_price || '∞'}
                <button onClick={() => { handleFilterChange('min_price', ''); handleFilterChange('max_price', ''); }} className="hover:text-primary-900">
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

        <div className="flex flex-col lg:flex-row gap-8">
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

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-secondary-800 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={filters.category === category.id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-secondary-700">{category.name}</span>
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
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="input text-sm py-2"
                  />
                  <span className="text-secondary-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="input text-sm py-2"
                  />
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-secondary-800 mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filters.size === size
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
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
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
