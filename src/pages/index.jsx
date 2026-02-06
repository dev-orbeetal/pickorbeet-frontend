import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBanners from '@/components/home/FeaturedBanners';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturesSection from '@/components/home/FeaturesSection';
import { fetchCategories, fetchFeaturedProducts, fetchProductsByCategory } from '@/store/slices/productsSlice';

export default function Home() {
  const dispatch = useDispatch();
  const { categories, featuredProducts, categoryProducts } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchProductsByCategory());
  }, [dispatch]);

  const hasFeaturedCategories = Array.isArray(categories) && categories.some(cat => cat.is_featured);

  return (
    <Layout
      title="Zzuhana - Premium Clothing Store"
      description="Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh."
    >
      {/* Show Featured Banners if categories are marked as featured, otherwise show default Hero */}
      {hasFeaturedCategories ? (
        <FeaturedBanners categories={categories} />
      ) : (
        <HeroSection />
      )}
      <FeaturesSection />
      <CategorySection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <CategoryShowcase categoryProducts={categoryProducts} />
    </Layout>
  );
}
