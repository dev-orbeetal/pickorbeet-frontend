import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Grid, List } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts } from '@/store/slices/productsSlice';
import siteConfig, { getAbsoluteImageUrl, getMediaUrl } from '@/lib/siteConfig';

const getImageUrl = (url) => getMediaUrl(url, '/images/placeholder-category.png');

export default function CategoryPage({ initialCategory }) {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const { products, categories, loading } = useSelector((state) => state.products);
  const category = categories.find(c => c.slug === slug);
  const hasSubcategories = category?.subcategories?.length > 0;

  // Categories are fetched globally in _app.jsx

  useEffect(() => {
    if (slug) {
      setActiveSubcategory(null);
      // Only fetch products if category has no subcategories
      if (category && !hasSubcategories) {
        dispatch(fetchProducts({ category_slug: slug }));
      }
    }
  }, [dispatch, slug, category, hasSubcategories]);

  const handleSubcategoryFilter = (subSlug) => {
    setActiveSubcategory(subSlug);
    dispatch(fetchProducts({ subcategory_slug: subSlug }));
  };

  const handleShowAll = () => {
    setActiveSubcategory(null);
    dispatch(fetchProducts({ category_slug: slug }));
  };

  return (
    <Layout
      title={`${category?.name || 'Category'} - Pickorbeet`}
      description={category?.tagline || `Shop ${category?.name || 'products'} at Pickorbeet. Premium quality clothing and accessories.`}
      image={category?.banner_image ? getAbsoluteImageUrl(category.banner_image) : undefined}
    >
      {/* Hero Banner */}
      <section className="relative h-56 md:h-72 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 overflow-hidden">
        {category?.banner_image && (
          <div className="absolute inset-0">
            <img
              src={getImageUrl(category.banner_image)}
              alt={category.name}
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent" />
        <div className="container-custom h-full flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <nav className="flex items-center gap-2 text-sm text-cream-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-cream-100">{category?.name || 'Category'}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              {category?.name || 'Category'}
            </h1>
            {category?.tagline && (
              <p className="text-lg md:text-xl text-cream-200 max-w-2xl">
                {category.tagline}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Subcategories as Cards (when category has subcategories) */}
      {hasSubcategories && !activeSubcategory && (
        <section className="py-12">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal-800 mb-3">
                Browse {category.name}
              </h2>
              <p className="text-charcoal-600">
                Select a subcategory to explore our collection
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {category.subcategories.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/category/${slug}/${sub.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-elegant border border-cream-200 hover:border-gold-300 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-cream-100">
                      <img
                        src={getImageUrl(sub.image)}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-category.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-lg group-hover:text-gold-300 transition-colors">
                          {sub.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm text-charcoal-600">
                        View Collection
                      </span>
                      <ArrowRight className="w-4 h-4 text-gold-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-10">
              <button
                onClick={handleShowAll}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
              >
                <Grid className="w-4 h-4" />
                View All Products in {category.name}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Subcategory Filter Pills (when viewing products with subcategories) */}
      {hasSubcategories && activeSubcategory && (
        <section className="py-6 border-b border-cream-400">
          <div className="container-custom">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleShowAll}
                className="px-4 py-2 bg-white border border-charcoal-200 text-charcoal-700 rounded-full text-sm font-medium hover:border-gold-500 hover:text-gold-600 transition-colors"
              >
                ← Back to Subcategories
              </button>
              <button
                onClick={() => {
                  setActiveSubcategory('all');
                  dispatch(fetchProducts({ category_slug: slug }));
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubcategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-charcoal-200 text-charcoal-700 hover:border-gold-500'
                  }`}
              >
                All
              </button>
              {category.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategoryFilter(sub.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubcategory === sub.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-charcoal-200 text-charcoal-700 hover:border-gold-500'
                    }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid (when no subcategories OR when filtering) */}
      {(!hasSubcategories || activeSubcategory) && (
        <section className="py-12">
          <div className="container-custom">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-cream-200 rounded-xl mb-3" />
                    <div className="h-4 bg-cream-200 rounded mb-2" />
                    <div className="h-4 bg-cream-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-charcoal-600">
                    Showing <span className="font-semibold text-charcoal-800">{products.length}</span> products
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-10 h-10 text-charcoal-400" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal-800 mb-2">
                  No products found
                </h3>
                <p className="text-charcoal-600 mb-6">
                  We couldn't find any products in this category
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.pickorbeet.com/api/v1';

  try {
    const res = await fetch(`${API_BASE_URL}/products/categories/${slug}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return { props: { initialCategory: null } };

    const category = await res.json();
    return { props: { initialCategory: category } };
  } catch (error) {
    return { props: { initialCategory: null } };
  }
}
