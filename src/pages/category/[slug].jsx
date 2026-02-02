import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts, fetchCategories } from '@/store/slices/productsSlice';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();
  
  const { products, categories, loading } = useSelector((state) => state.products);
  const category = categories.find(c => c.slug === slug);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProducts({ category_slug: slug }));
    }
  }, [dispatch, slug]);

  return (
    <Layout title={`${category?.name || 'Category'} - Zzuhana`}>
      {/* Hero Banner */}
      <section className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-800">
        {category?.image && (
          <div className="absolute inset-0">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="container-custom h-full flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {category?.name || 'Category'}
            </h1>
            {category?.description && (
              <p className="text-xl text-primary-100 max-w-2xl">
                {category.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Subcategories */}
      {category?.subcategories?.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => dispatch(fetchProducts({ category_slug: slug }))}
                className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium"
              >
                All
              </button>
              {category.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => dispatch(fetchProducts({ subcategory_slug: sub.slug }))}
                  className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-secondary-700 hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-12">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <p className="text-secondary-600 text-lg mb-4">
                No products found in this category
              </p>
              <button
                onClick={() => router.push('/products')}
                className="btn btn-primary"
              >
                Browse All Products
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
