import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { ArrowLeftRight, Eye, Heart, ShoppingCart } from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/siteConfig';
import { COMPARE_KEY, WISHLIST_KEY, readList, subscribeLists, toggleList } from '@/lib/productLists';
import QuickViewModal from '@/components/products/QuickViewModal';

function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `৳${Math.round(amount).toLocaleString()}`;
}

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [compared, setCompared] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const sync = () => {
      setWishlisted(readList(WISHLIST_KEY).includes(product.id));
      setCompared(readList(COMPARE_KEY).includes(product.id));
    };
    sync();
    return subscribeLists(sync);
  }, [product.id]);

  const handleAddToCart = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (adding || product.is_out_of_stock) return;
    if (product.variants?.length > 0) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    setAdding(true);
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap();
      setJustAdded(true);
      toast.success('Added to cart');
      setTimeout(() => setJustAdded(false), 1600);
    } catch (error) {
      toast.error(error?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = toggleList(WISHLIST_KEY, product.id);
    setWishlisted(result.added);
    toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = toggleList(COMPARE_KEY, product.id, 4);
    if (!result.ok) {
      toast.error('You can compare up to 4 products');
      return;
    }
    setCompared(result.added);
    toast.success(result.added ? 'Added to compare' : 'Removed from compare');
  };

  const openQuickView = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setQuickOpen(true);
  };

  const price = Number(product.price);
  const comparePrice = product.compare_price !== null && product.compare_price !== undefined && product.compare_price !== ''
    ? Number(product.compare_price)
    : null;
  const hasDiscount = Number.isFinite(comparePrice) && comparePrice > price;
  const saved = hasDiscount ? Math.round(comparePrice - price) : 0;
  const discount = hasDiscount
    ? (Number(product.discount_percentage) || Math.round(((comparePrice - price) / comparePrice) * 100))
    : 0;
  const sku = product.sku || '';
  const imageUrl = getMediaUrl(product.primary_image, '/images/placeholder.svg');

  return (
    <article className="product-card group flex h-full min-w-0 flex-col rounded-xl border border-[#E4E9F2] bg-white p-2 shadow-[0_1px_2px_rgba(23,32,51,0.05)]">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action">
          <div className="aspect-square overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt={product.name}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {hasDiscount && discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-gold-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-charcoal-500 shadow-sm ring-1 ring-black/5 transition-colors hover:text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action ${wishlisted ? 'text-gold-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-2">
        <Link href={`/product/${product.slug}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-5 text-charcoal-900">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 h-4 truncate text-[11px] text-charcoal-500">{sku || '\u00A0'}</p>
        <p className="mt-1 flex h-5 items-baseline gap-1.5 overflow-hidden">
          <span className="shrink-0 text-sm font-bold text-charcoal-900">{money(price)}</span>
          {hasDiscount && (
            <span className="truncate text-xs text-charcoal-400 line-through">{money(comparePrice)}</span>
          )}
        </p>
        <p className={`h-4 truncate text-[11px] font-medium ${product.is_out_of_stock ? 'text-red-600' : 'text-savings'}`}>
          {product.is_out_of_stock ? 'Out of stock' : hasDiscount ? `Save ${money(saved)}` : '\u00A0'}
        </p>

        <div className="mt-auto flex items-center gap-1 pt-1.5">
          <button
            type="button"
            onClick={handleCompare}
            aria-pressed={compared}
            aria-label={compared ? 'Remove from compare' : 'Compare'}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E4E9F2] bg-white text-charcoal-500 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action ${compared ? 'border-action text-action' : ''}`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={openQuickView}
            aria-label="Quick view"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E4E9F2] bg-white text-charcoal-500 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.is_out_of_stock}
            className="flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-md bg-action px-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#1d54cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#C5CDD8]"
          >
            <ShoppingCart className="cart-action-icon h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.is_out_of_stock ? 'Out of stock' : adding ? 'Adding...' : justAdded ? 'Added' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {quickOpen && typeof document !== 'undefined' && createPortal(
        <QuickViewModal
          product={product}
          onClose={() => setQuickOpen(false)}
          onAddToCart={handleAddToCart}
          adding={adding}
          justAdded={justAdded}
        />,
        document.body,
      )}
    </article>
  );
}
