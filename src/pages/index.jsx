import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBanners from '@/components/home/FeaturedBanners';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturesSection from '@/components/home/FeaturesSection';
import PageLoader from '@/components/ui/PageLoader';
import { fetchFeaturedProducts, fetchProductsByCategory } from '@/store/slices/productsSlice';

export default function Home() {
  const dispatch = useDispatch();
  const {
    categories,
    featuredProducts,
    categoryProducts,
    categoriesLoading,
    featuredLoading,
    categoryProductsLoading,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchProductsByCategory());
  }, [dispatch]);

  const isInitialLoading = categoriesLoading && featuredLoading && categoryProductsLoading;

  const hasFeaturedCategories = Array.isArray(categories) && categories.some(cat => cat.is_featured);

  return (
    <>
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <PageLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <Layout
        title="Zzuhana - Premium Clothing Store"
        description="Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh."
      >
        {!categoriesLoading && (
          <>
            {hasFeaturedCategories ? (
              <FeaturedBanners categories={categories} />
            ) : (
              <HeroSection />
            )}
          </>
        )}
        <FeaturesSection />
        {!categoriesLoading && <CategorySection categories={categories} />}
        {!featuredLoading && <FeaturedProducts products={featuredProducts} />}
        {!categoryProductsLoading && <CategoryShowcase categoryProducts={categoryProducts} />}
      </Layout>
    </>
  );
}
