import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryIconRow from '@/components/home/CategoryIconRow';
import TrustStrip from '@/components/home/TrustStrip';
import HomeProductRow from '@/components/home/HomeProductRow';
import PromoBanners from '@/components/home/PromoBanners';
import ValueBand from '@/components/home/ValueBand';
import { productsAPI } from '@/lib/api';
import { useSelector } from 'react-redux';

function asList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

export default function Home() {
  const { categories } = useSelector((state) => state.products);
  const [banners, setBanners] = useState([]);
  const [deals, setDeals] = useState([]);
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    let active = true;

    productsAPI.getBanners()
      .then((response) => {
        if (active) setBanners(asList(response.data));
      })
      .catch(() => {
        if (active) setBanners([]);
      });

    productsAPI.getProducts({ on_sale: 1, ordering: '-created_at' })
      .then((response) => {
        if (active) setDeals(asList(response.data));
      })
      .catch(() => {
        if (active) setDeals([]);
      });

    productsAPI.getProducts({ ordering: '-created_at' })
      .then((response) => {
        if (active) setArrivals(asList(response.data));
      })
      .catch(() => {
        if (active) setArrivals([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const heroBanners = banners.filter((banner) => banner.placement === 'hero');
  const promoBanners = banners.filter((banner) => banner.placement === 'promo');

  return (
    <Layout
      title="PickOrbeet - Shop Smarter, Live Better"
      description="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products, fast delivery, and secure payment across Bangladesh."
    >
      <HeroSlider banners={heroBanners} />
      <CategoryIconRow categories={categories} />
      <TrustStrip />
      <HomeProductRow
        title="Today's Deals"
        viewAllHref="/products?on_sale=1"
        viewAllLabel="View All Deals"
        products={deals}
      />
      <PromoBanners banners={promoBanners} />
      <HomeProductRow
        title="New Arrivals"
        viewAllHref="/products"
        viewAllLabel="View All"
        products={arrivals}
      />
      <ValueBand />
    </Layout>
  );
}
