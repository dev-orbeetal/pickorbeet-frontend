import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryIconRow from '@/components/home/CategoryIconRow';
import TrustStrip from '@/components/home/TrustStrip';
import HomeProductRow from '@/components/home/HomeProductRow';
import PromoBanners from '@/components/home/PromoBanners';
import { productsAPI } from '@/lib/api';

export default function Home() {
  const { categories } = useSelector((state) => state.products);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let active = true;
    productsAPI.getHomepage()
      .then((response) => {
        if (active) setSections(response.data.sections || []);
      })
      .catch(() => {
        if (active) setSections([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout
      title="PickOrbeet - Shop Smarter, Live Better"
      description="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products, fast delivery, and secure payment across Bangladesh."
    >
      {sections.map((section) => {
        if (section.type === 'hero') return <HeroSlider key={section.key} banners={section.banners} />;
        if (section.type === 'categories') return <CategoryIconRow key={section.key} categories={categories} />;
        if (section.type === 'benefits') return <TrustStrip key={section.key} items={section.items} />;
        if (section.type === 'promos') return <PromoBanners key={section.key} banners={section.banners} />;
        if (section.type === 'products') {
          return (
            <HomeProductRow
              key={section.key}
              title={section.title}
              viewAllHref={section.view_all_url || '/products'}
              viewAllLabel={section.view_all_label || 'View All'}
              products={section.products}
            />
          );
        }
        return null;
      })}
    </Layout>
  );
}
