import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/loading/ProductGridSkeleton';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { productsAPI } from '@/lib/api';
import { WISHLIST_KEY, readList, subscribeLists } from '@/lib/productLists';

export default function WishlistPage() {
  const [ids, setIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useBootGate(loading);

  useEffect(() => {
    const sync = () => setIds(readList(WISHLIST_KEY));
    sync();
    setHydrated(true);
    return subscribeLists(sync);
  }, []);

  useEffect(() => {
    if (!hydrated) return undefined;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      setError(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError(false);
    productsAPI.getProducts({ ids: ids.join(',') })
      .then((response) => {
        if (!active) return;
        const data = response.data;
        const list = Array.isArray(data) ? data : data?.results || [];
        const byId = new Map(list.map((product) => [String(product.id), product]));
        setProducts(ids.map((id) => byId.get(String(id))).filter(Boolean));
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hydrated, ids, reloadKey]);

  return (
    <Layout title="Wishlist - PickOrbeet" description="Products you saved on PickOrbeet." noindex>
      <div className="container-custom py-5 sm:py-8">
        <h1 className="text-xl font-bold text-charcoal-900 sm:text-2xl">Wishlist</h1>
        <p className="mt-1 text-sm text-charcoal-500">
          {loading ? 'Loading saved products...' : `${products.length} saved ${products.length === 1 ? 'product' : 'products'}`}
        </p>

        {loading && (
          <ProductGridSkeleton className="mt-4" count={Math.max(ids.length, 4)} />
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-[#E4E9F2] bg-white px-4 py-10 text-center">
            <p className="text-sm text-charcoal-700">Couldn&apos;t load your wishlist. Please try again.</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-4 h-10 rounded-lg bg-action px-4 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mt-8 rounded-xl border border-[#E4E9F2] bg-white px-4 py-10 text-center">
            <p className="text-sm text-charcoal-700">Your wishlist is empty.</p>
            <Link href="/products" className="mt-4 inline-flex h-10 items-center rounded-lg bg-action px-4 text-sm font-semibold text-white">
              Browse products
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <ProductGrid className="mt-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        )}
      </div>
    </Layout>
  );
}
