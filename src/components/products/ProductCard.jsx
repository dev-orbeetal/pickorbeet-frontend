import { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/siteConfig';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAddingToCart || product.is_out_of_stock) return;

    if (product.variants?.length > 0) {
      window.location.href = `/product/${product.slug}`;
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap();
      setJustAdded(true);
      toast.success('Added to cart!');
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(error?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsWishlisted((current) => !current);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const imageUrl = getMediaUrl(product.primary_image, '/images/placeholder.svg');
  const price = parseFloat(product.price);
  const comparePrice = product.compare_price ? parseFloat(product.compare_price) : null;
  const hasDiscount = comparePrice && comparePrice > price;

  return (
    <article className="group h-full bg-white rounded-xl border border-cream-400 shadow-sm hover:shadow-elegant transition-shadow flex flex-col">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="aspect-square bg-cream-100 rounded-t-xl overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {hasDiscount && product.discount_percentage > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-gold-500 text-white text-xs font-bold">
            -{product.discount_percentage}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center bg-white ${
            isWishlisted ? 'text-gold-500 border-gold-500' : 'text-charcoal-400 border-cream-400 hover:text-gold-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {product.is_out_of_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-t-xl">
            <span className="px-3 py-1.5 bg-charcoal-900 text-white text-xs font-semibold rounded-md">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-charcoal-800 line-clamp-2 min-h-[40px] hover:text-navy-800">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gold-500">৳{price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-charcoal-400 line-through">৳{comparePrice.toLocaleString()}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.is_out_of_stock}
          className={`mt-3 w-full h-9 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            justAdded
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
              : 'border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gold-600'
          }`}
        >
          {justAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {justAdded ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
