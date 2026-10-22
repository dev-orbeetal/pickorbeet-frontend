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

const actionClass = 'flex h-9 w-9 items-center justify-center rounded-full bg-white text-charcoal-600 shadow-md ring-1 ring-black/5 transition-colors hover:text-navy-800';

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

  const price = parseFloat(product.price);
  const comparePrice = product.compare_price ? parseFloat(product.compare_price) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const saved = hasDiscount ? Math.round(comparePrice - price) : 0;
  const subtitle = product.short_description || product.sku || '';
  const imageUrl = getMediaUrl(product.primary_image, '/images/placeholder.svg');

  return (
    <article className="product-card group flex h-full flex-col">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="aspect-square">
            <img src={imageUrl} alt={product.name} className="h-full w-full object-contain" />
          </div>
        </Link>

        <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 translate-x-2 flex-col gap-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100 max-md:pointer-events-auto max-md:translate-x-0 max-md:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:pointer-events-auto [@media(pointer:coarse)]:translate-x-0 [@media(pointer:coarse)]:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.is_out_of_stock}
            aria-label="Add to cart"
            className={`${actionClass} disabled:opacity-40 ${justAdded ? 'text-emerald-600' : ''}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCompare}
            aria-pressed={compared}
            aria-label={compared ? 'Remove from compare' : 'Compare'}
            className={`${actionClass} ${compared ? 'text-navy-800' : ''}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`${actionClass} ${wishlisted ? 'text-gold-600' : ''}`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          <button type="button" onClick={openQuickView} aria-label="Quick view" className={actionClass}>
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-5 text-blue-600 hover:underline">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 h-4 truncate text-xs text-charcoal-500">{subtitle || '\u00A0'}</p>
        <p className="mt-1 flex h-5 items-baseline gap-1.5 overflow-hidden">
          <span className="shrink-0 text-sm font-bold text-blue-600">৳{price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="truncate text-xs text-charcoal-400 line-through">৳{comparePrice.toLocaleString()}</span>
          )}
        </p>
        <p className={`h-4 truncate text-xs ${product.is_out_of_stock ? 'text-red-600' : 'text-emerald-600'}`}>
          {product.is_out_of_stock ? 'Out of stock' : hasDiscount ? `Save Tk ${saved.toLocaleString()}` : '\u00A0'}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || product.is_out_of_stock}
          className="mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-charcoal-300"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.is_out_of_stock ? 'Out of stock' : justAdded ? 'Added' : 'Add to Cart'}
        </button>
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
