import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Grid, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/loading/ProductGridSkeleton';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { fetchProducts, fetchCategories } from '@/store/slices/productsSlice';
import { getMediaUrl } from '@/lib/siteConfig';

const getImageUrl = (url) => getMediaUrl(url, '/images/placeholder-category.png');

export default function SubcategoryPage() {
  const router = useRouter();
  const { slug, subcategory } = router.query;
  const dispatch = useDispatch();

  const { products, categories, loading } = useSelector((state) => state.products);
  const [listState, setListState] = useState('loading');
  const category = categories.find(c => c.slug === slug);
  const subcategoryData = category?.subcategories?.find(s => s.slug === subcategory);
  useBootGate(listState === 'loading' && products.length === 0);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!subcategory) return undefined;
    let active = true;
    setListState('loading');
    dispatch(fetchProducts({ subcategory_slug: subcategory }))
      .unwrap()
      .then(() => { if (active) setListState('ready'); })
      .catch(() => { if (active) setListState('error'); });
    return () => { active = false; };
  }, [dispatch, subcategory]);

  return (
    <Layout title={`${subcategoryData?.name || 'Subcategory'} - ${category?.name || 'Category'} - Pickorbeet`}>
      {/* Hero Banner */}
      <section className="relative h-48 md:h-64 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 overflow-hidden">
        {subcategoryData?.image && (
          <div className="absolute inset-0">
            <img
              src={getImageUrl(subcategoryData.image)}
              alt={subcategoryData.name}
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
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-cream-200 mb-4 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/category/${slug}`} className="hover:text-white transition-colors">
                {category?.name || 'Category'}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-cream-100">{subcategoryData?.name || 'Subcategory'}</span>
            </nav>
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-2">
              {subcategoryData?.name || 'Subcategory'}
            </h1>
            {subcategoryData?.description && (
              <p className="text-base md:text-lg text-cream-200 max-w-2xl">
                {subcategoryData.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Sibling Subcategories Navigation */}
      {category?.subcategories?.length > 1 && (
        <section className="py-4 border-b border-cream-400">
          <div className="container-custom">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/category/${slug}`}
                className="px-4 py-2 bg-white border border-charcoal-200 text-charcoal-700 rounded-full text-sm font-medium hover:border-gold-500 hover:text-gold-600 transition-colors"
              >
                ← All {category.name}
              </Link>
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${slug}/${sub.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sub.slug === subcategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-charcoal-200 text-charcoal-700 hover:border-gold-500'
                    }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-4 md:py-12">
        <div className="container-custom">
          {(listState === 'loading' || loading) && products.length === 0 ? (
            <ProductGridSkeleton count={8} />
          ) : listState === 'error' && products.length === 0 ? (
            <div className="py-16 text-center">
              <h3 className="mb-2 text-xl font-semibold text-charcoal-800">Couldn&apos;t load products</h3>
              <p className="mb-6 text-charcoal-600">Please try again in a moment.</p>
              <button
                type="button"
                onClick={() => {
                  setListState('loading');
                  dispatch(fetchProducts({ subcategory_slug: subcategory }))
                    .unwrap()
                    .then(() => setListState('ready'))
                    .catch(() => setListState('error'));
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
              >
                Try again
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between md:mb-6">
                <p className="text-charcoal-600">
                  Showing <span className="font-semibold text-charcoal-800">{products.length}</span> products
                </p>
              </div>
              <ProductGrid>
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
              </ProductGrid>
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
                We couldn't find any products in this subcategory
              </p>
              <Link
                href={`/category/${slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
              >
                Browse {category?.name || 'Category'}
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
