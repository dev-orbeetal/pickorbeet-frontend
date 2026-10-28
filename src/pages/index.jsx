import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryIconRow from '@/components/home/CategoryIconRow';
import TrustStrip from '@/components/home/TrustStrip';
import HomeProductRow from '@/components/home/HomeProductRow';
import PromoBanners from '@/components/home/PromoBanners';
import HomeSkeleton from '@/components/loading/HomeSkeleton';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { productsAPI } from '@/lib/api';
import { buildSiteJsonLd } from '@/lib/seo';
import { fetchApi, serializable } from '@/lib/serverApi';

export default function Home({ initialSections = [], storeContact = null }) {
  const { categories } = useSelector((state) => state.products);
  const [sections, setSections] = useState(initialSections);
  const [status, setStatus] = useState(initialSections.length ? 'ready' : 'loading');
  const [reloadKey, setReloadKey] = useState(0);
  useBootGate(status === 'loading');

  useEffect(() => {
    let active = true;
    if (reloadKey > 0) setStatus('loading');
    productsAPI.getHomepage()
      .then((response) => {
        if (!active) return;
        const next = response.data.sections || [];
        setSections(next);
        setStatus(next.length ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!active) return;
        setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <Layout
      title="PickOrbeet - Shop Smarter, Live Better"
      description="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products, fast delivery, and secure payment across Bangladesh."
      jsonLd={buildSiteJsonLd(storeContact)}
    >
      <h1 className="container-custom py-4 text-xl font-bold text-charcoal-900 md:text-2xl">
        Shop original products in Bangladesh
      </h1>
      {status === 'loading' && <HomeSkeleton />}
      {status === 'error' && (
        <div className="container-custom py-16 text-center">
          <p className="text-charcoal-700">Couldn&apos;t load the store. Please try again.</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 h-10 rounded-lg bg-action px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}
      {status === 'empty' && (
        <div className="container-custom py-16 text-center">
          <p className="text-charcoal-600">No products to show right now.</p>
        </div>
      )}
      {status === 'ready' && sections.map((section) => {
        if (section.type === 'hero') {
          const sideCards = sections.find((item) => item.type === 'promos')?.banners || [];
          return <HeroSlider key={section.key} banners={section.banners} cards={sideCards} />;
        }
        if (section.type === 'categories') return <CategoryIconRow key={section.key} categories={categories} />;
        if (section.type === 'benefits') return <TrustStrip key={section.key} items={section.items} />;
        if (section.type === 'promos') {
          if (sections.some((item) => item.type === 'hero')) return null;
          return <PromoBanners key={section.key} banners={section.banners} />;
        }
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

export async function getServerSideProps() {
  try {
    const [homeResult, settingsResult] = await Promise.all([
      fetchApi('/products/homepage/'),
      fetchApi('/products/settings/public/'),
    ]);
    const sections = homeResult.ok && Array.isArray(homeResult.data?.sections)
      ? homeResult.data.sections
      : [];
    return {
      props: {
        initialSections: serializable(sections) || [],
        storeContact: settingsResult.ok ? serializable(settingsResult.data) : null,
      },
    };
  } catch (error) {
    return { props: { initialSections: [], storeContact: null } };
  }
}
