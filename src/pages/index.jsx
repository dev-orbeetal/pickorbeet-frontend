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

function findSection(sections, type) {
  return sections.find((section) => section.type === type) || null;
}

function findProductRow(sections, token) {
  return sections.find((section) => {
    if (section.type !== 'products') return false;
    return `${section.key || ''} ${section.title || ''}`.toLowerCase().includes(token);
  }) || null;
}

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
      .then((homeResponse) => {
        if (!active) return;
        const next = homeResponse.data.sections || [];
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

  const hero = findSection(sections, 'hero');
  const promos = findSection(sections, 'promos');
  const benefits = findSection(sections, 'benefits');
  const trending = findProductRow(sections, 'trending');
  const arrivals = findProductRow(sections, 'new');

  return (
    <Layout
      title="PickOrbeet - Shop Smarter, Live Better"
      description="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products, fast delivery, and secure payment across Bangladesh."
      jsonLd={buildSiteJsonLd(storeContact)}
    >
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
      {status === 'ready' && (
        <>
          {hero && (
            <HeroSlider banners={hero.banners} cards={promos?.banners || []} />
          )}
          {!hero && promos && <PromoBanners banners={promos.banners} />}
          {benefits && <TrustStrip items={benefits.items} />}
          {trending && (
            <HomeProductRow
              title={trending.title}
              viewAllHref={trending.view_all_url || '/products'}
              viewAllLabel={trending.view_all_label || 'View All'}
              products={trending.products || []}
            />
          )}
          {arrivals && arrivals !== trending && (
            <HomeProductRow
              title={arrivals.title}
              viewAllHref={arrivals.view_all_url || '/products'}
              viewAllLabel={arrivals.view_all_label || 'View All'}
              products={arrivals.products || []}
            />
          )}
          <CategoryIconRow categories={categories} />
        </>
      )}
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
