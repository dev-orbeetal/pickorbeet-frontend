import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Grid } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/loading/ProductGridSkeleton';
import { useBootGate } from '@/components/loading/LoadingProvider';
import CatalogControls, { catalogQuery } from '@/components/catalog/CatalogControls';
import { fetchProducts } from '@/store/slices/productsSlice';
import { buildOgImageUrl, getAbsoluteImageUrl, getMediaUrl } from '@/lib/siteConfig';

const getImageUrl = (url) => getMediaUrl(url, '/images/placeholder-category.png');

function orderedSubcategories(category) {
  return [...(category?.subcategories || [])]
    .filter((sub) => sub && sub.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export default function CategoryPage({ initialCategory }) {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [ordering, setOrdering] = useState('-created_at');
  const [onSale, setOnSale] = useState(false);

  const { categories, categoriesLoading } = useSelector((state) => state.products);
  const [listed, setListed] = useState([]);
  const [listState, setListState] = useState('loading');
  const storedCategory = categories.find((item) => item.slug === slug);
  const category = storedCategory || (initialCategory?.slug === slug ? initialCategory : null);
  const subcategories = orderedSubcategories(category);
  const hasSubcategories = subcategories.length > 0;
  useBootGate(listState === 'loading' && !hasSubcategories && listed.length === 0);

  useEffect(() => {
    setActiveSubcategory(null);
    setOrdering('-created_at');
    setOnSale(false);
  }, [slug]);

  useEffect(() => {
    if (!slug || !category) return undefined;
    if (hasSubcategories && !activeSubcategory) {
      setListState('ready');
      return undefined;
    }
    let active = true;
    setListed([]);
    setListState('loading');
    const viewingSubcategory = activeSubcategory && activeSubcategory !== 'all';
    dispatch(fetchProducts(catalogQuery({
      categorySlug: viewingSubcategory ? undefined : slug,
      subcategorySlug: viewingSubcategory ? activeSubcategory : undefined,
      ordering,
      onSale,
    })))
      .unwrap()
      .then((data) => {
        if (!active) return;
        const rows = data?.results || data || [];
        setListed(Array.isArray(rows) ? rows : []);
        setListState('ready');
      })
      .catch(() => { if (active) setListState('error'); });
    return () => { active = false; };
  }, [dispatch, slug, category, hasSubcategories, activeSubcategory, ordering, onSale]);

  useEffect(() => {
    if (!slug || category || categoriesLoading) return;
    setListState('missing');
  }, [slug, category, categoriesLoading]);

  const handleSubcategoryFilter = (subSlug) => {
    setActiveSubcategory(subSlug);
  };

  const handleShowAll = () => {
    setActiveSubcategory(null);
  };

  return (
    <Layout
      title={`${category?.name || 'Category'} - PickOrbeet`}
      description={category?.tagline || `Shop ${category?.name || 'products'} at PickOrbeet. Original products with fast delivery across Bangladesh.`}
      image={category?.name ? buildOgImageUrl({
        title: category.name,
        eyebrow: 'Shop',
        image: (category.image || category.banner_image)
          ? getAbsoluteImageUrl(category.image || category.banner_image)
          : undefined,
      }) : undefined}
    >
      <section className="border-b border-[#E4E9F2] bg-white">
        <div className="container-custom py-4 md:py-6">
          <nav className="mb-2 flex items-center gap-1 text-sm text-charcoal-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy-900">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium text-charcoal-900">{category?.name || 'Category'}</span>
          </nav>
          <h1 className="text-2xl font-bold text-charcoal-900 md:text-3xl">
            {category?.name || 'Category'}
          </h1>
          {category?.tagline && (
            <p className="mt-1 max-w-2xl text-sm text-charcoal-600 md:text-base">
              {category.tagline}
            </p>
          )}
        </div>
      </section>

      {category?.banner_image && (
        <div className="container-custom pt-4">
          <img
            src={getImageUrl(category.banner_image)}
            alt=""
            className="aspect-[3/1] w-full rounded-xl object-cover"
          />
        </div>
      )}

      {hasSubcategories && !activeSubcategory && (
        <section className="py-4 md:py-8" aria-labelledby="browse-category">
          <div className="container-custom">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="browse-category" className="text-lg font-bold text-charcoal-900 md:text-xl">
                  Browse {category.name}
                </h2>
                <p className="mt-1 text-sm text-charcoal-500">
                  Select a subcategory to explore our collection
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubcategory('all')}
                className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-action px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d54cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
              >
                <Grid className="h-4 w-4" aria-hidden="true" />
                View all products
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {subcategories.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={`/category/${slug}/${sub.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E4E9F2] bg-white shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition-shadow hover:shadow-[0_10px_24px_-16px_rgba(20,27,77,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-[#F5F7FC]">
                      <img
                        src={getImageUrl(sub.image)}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-category.png';
                        }}
                      />
                    </span>
                    <span className="flex flex-1 items-center justify-between gap-2 p-3">
                      <span className="text-sm font-semibold leading-snug text-charcoal-900 md:text-[15px]">
                        {sub.name}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-action transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              ))}
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
                onClick={() => setActiveSubcategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubcategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-charcoal-200 text-charcoal-700 hover:border-gold-500'
                  }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
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
        <section className="py-4 md:py-12">
          <div className="container-custom">
            <CatalogControls
              ordering={ordering}
              onSale={onSale}
              onOrdering={setOrdering}
              onSaleChange={setOnSale}
            />
            {listState === 'loading' && listed.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : listState === 'error' && listed.length === 0 ? (
              <div className="py-16 text-center">
                <h3 className="mb-2 text-xl font-semibold text-charcoal-800">Couldn&apos;t load products</h3>
                <p className="mb-6 text-charcoal-600">Please try again in a moment.</p>
                <button
                  type="button"
                  onClick={handleShowAll}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Try again
                </button>
              </div>
            ) : listed.length > 0 ? (
              <>
                <div className="mb-3 md:mb-6">
                  <p className="text-charcoal-600">
                    Showing <span className="font-semibold text-charcoal-800">{listed.length}</span> products
                  </p>
                </div>
                <ProductGrid>
                  {listed.map((product, index) => (
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
