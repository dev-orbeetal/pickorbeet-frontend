import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryProducts from '@/components/home/CategoryProducts';
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

  return (
    <Layout title="Zzuhana - Premium Clothing Store">
      <HeroSection />
      <FeaturesSection />
      <CategorySection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <CategoryProducts categoryProducts={categoryProducts} />
    </Layout>
  );
}
