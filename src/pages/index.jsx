import { Fragment, useEffect, useMemo, useState } from 'react';
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
import { fetchApi, productRows, serializable } from '@/lib/serverApi';

function productSectionRank(section) {
  const key = `${section.key || ''} ${section.title || ''}`.toLowerCase();
  if (key.includes('trending')) return 0;
  if (key.includes('new')) return 1;
  return 2;
}

const HOME_LATEST_COUNT = 8;

function latestProducts(data) {
  return productRows(data).slice(0, HOME_LATEST_COUNT);
}

export default function Home({ initialSections = [], storeContact = null, initialAllProducts = [] }) {
  const { categories } = useSelector((state) => state.products);
  const [sections, setSections] = useState(initialSections);
  const [allProducts, setAllProducts] = useState(initialAllProducts);
  const [status, setStatus] = useState(initialSections.length ? 'ready' : 'loading');
  const [reloadKey, setReloadKey] = useState(0);
  useBootGate(status === 'loading');

  useEffect(() => {
    let active = true;
    if (reloadKey > 0) setStatus('loading');
    Promise.all([
      productsAPI.getHomepage(),
      productsAPI.getProducts({ ordering: '-created_at', page: 1 }),
    ])
      .then(([homeResponse, productsResponse]) => {
        if (!active) return;
        const next = homeResponse.data.sections || [];
        setSections(next);
        setAllProducts(latestProducts(productsResponse.data));
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

  const productRows = useMemo(() => {
    const fromApi = sections
      .filter((section) => section.type === 'products')
      .sort((a, b) => productSectionRank(a) - productSectionRank(b))
      .map((section) => ({
        key: section.key || section.title,
        title: section.title,
        viewAllHref: section.view_all_url || '/products',
        viewAllLabel: section.view_all_label || 'View All',
        products: section.products || [],
        showAll: false,
      }));

    return [
      ...fromApi,
      {
        key: 'all-products',
        title: 'All Products',
        viewAllHref: '/products',
        viewAllLabel: 'View All',
        products: allProducts,
        showAll: false,
      },
    ];
  }, [sections, allProducts]);

  const homeBlocks = useMemo(() => {
    const blocks = [];
    let productsPlaced = false;
    sections.forEach((section) => {
      if (section.type === 'products') {
        if (!productsPlaced) {
          blocks.push({ kind: 'products', key: 'home-product-rows' });
          productsPlaced = true;
        }
        return;
      }
      blocks.push({ kind: 'section', key: section.key || section.type, section });
    });
    if (!productsPlaced && productRows.some((row) => row.products.length > 0)) {
      blocks.push({ kind: 'products', key: 'home-product-rows' });
    }
    return blocks;
  }, [sections, productRows]);

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
      {status === 'ready' && homeBlocks.map((block) => {
        if (block.kind === 'products') {
          return (
            <Fragment key={block.key}>
              {productRows.map((row) => (
                <HomeProductRow
                  key={row.key}
                  title={row.title}
                  viewAllHref={row.viewAllHref}
                  viewAllLabel={row.viewAllLabel}
                  products={row.products}
                  showAll={row.showAll}
                />
              ))}
            </Fragment>
          );
        }
        const section = block.section;
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
        return null;
      })}
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [homeResult, settingsResult, productResult] = await Promise.all([
      fetchApi('/products/homepage/'),
      fetchApi('/products/settings/public/'),
      fetchApi('/products/?ordering=-created_at&page=1'),
    ]);
    const sections = homeResult.ok && Array.isArray(homeResult.data?.sections)
      ? homeResult.data.sections
      : [];
    return {
      props: {
        initialSections: serializable(sections) || [],
        initialAllProducts: serializable(latestProducts(productResult.ok ? productResult.data : null)) || [],
        storeContact: settingsResult.ok ? serializable(settingsResult.data) : null,
      },
    };
  } catch (error) {
    return { props: { initialSections: [], initialAllProducts: [], storeContact: null } };
  }
}
