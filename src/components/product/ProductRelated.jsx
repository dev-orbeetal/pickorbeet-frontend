import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart } from '@/store/slices/cartSlice';
import { getMediaUrl } from '@/lib/siteConfig';
import { WISHLIST_KEY, readList, subscribeLists, toggleList } from '@/lib/productLists';
import Stars from '@/components/product/Stars';

function taka(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `৳${Math.round(amount).toLocaleString()}`;
}

function RelatedCard({ product }) {
  const reduce = useReducedMotion();
  const dispatch = useDispatch();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readList(WISHLIST_KEY).includes(product.id));
    sync();
    return subscribeLists(sync);
  }, [product.id]);

  const price = Number(product.price);
  const compare = product.compare_price === null || product.compare_price === undefined || product.compare_price === ''
    ? null
    : Number(product.compare_price);
  const hasDiscount = Number.isFinite(compare) && compare > price;
  const discount = hasDiscount
    ? (Number(product.discount_percentage) || Math.round(((compare - price) / compare) * 100))
    : 0;
  const count = Number(product.review_count) || 0;
  const average = Number(product.rating_average);
  const image = getMediaUrl(product.primary_image, '/images/placeholder.svg');

  const wishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = toggleList(WISHLIST_KEY, product.id, 50);
    if (!result.ok) {
      toast.error('Your wishlist is full');
      return;
    }
    setSaved(result.added);
    toast.success(result.added ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const cart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (product.is_out_of_stock || adding) return;
    if (product.variants?.length > 0) {
      router.push(`/product/${product.slug}`);
      return;
    }
    setAdding(true);
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap();
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col"
    >
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-md bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]">
          <img
            src={image}
            alt={product.name}
            className="aspect-square w-full object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-[#FF7A1A] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
            -{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={wishlist}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-[#687386] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-7 lg:w-7"
        >
          <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-[#FF7A1A] text-[#FF7A1A]' : ''}`} />
        </button>
      </div>
      <Link href={`/product/${product.slug}`} className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-4 text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]">
        {product.name}
      </Link>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1">
        <span className="text-[13px] font-bold text-[#172033]">{taka(price)}</span>
        {hasDiscount && <span className="text-[11px] text-[#A3ADBD] line-through">{taka(compare)}</span>}
      </p>
      <div className="mt-auto flex items-center justify-between gap-1 pt-1">
        <span className="flex min-w-0 items-center gap-1">
          <Stars value={count > 0 ? average : 0} size={11} />
          {count > 0 && Number.isFinite(average) && (
            <span className="truncate text-[10px] text-[#8B95A7]">{average.toFixed(1)} ({count})</span>
          )}
        </span>
        <button
          type="button"
          onClick={cart}
          disabled={adding || product.is_out_of_stock}
          aria-label={product.is_out_of_stock ? 'Out of stock' : 'Add to cart'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E6ECF5] text-[#2864E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] disabled:opacity-40 lg:h-7 lg:w-7"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.article>
  );
}

export default function ProductRelated({ products, categorySlug }) {
  if (!products.length) return null;
  const href = categorySlug ? `/category/${categorySlug}` : '/products';

  return (
    <aside className="rounded-2xl border border-[#E6ECF5] bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[#172033]">You may also like</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2864E8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]">
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {products.map((product) => (
          <RelatedCard key={product.id} product={product} />
        ))}
      </div>
    </aside>
  );
}
