import { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Check, Sparkles } from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

const quickActionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15 }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 },
};

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || product.is_out_of_stock) return;

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

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const imageUrl = product.primary_image
    ? (product.primary_image.startsWith('http') ? product.primary_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${product.primary_image}`)
    : '/images/placeholder.svg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-elegant border border-gray-100/50 hover:shadow-elegant-lg hover:border-gray-200/50 transition-all duration-500">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
            <motion.img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.discount_percentage > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg"
                >
                  <Sparkles className="w-3 h-3" />
                  -{product.discount_percentage}%
                </motion.div>
              )}
              {product.is_featured && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                >
                  Featured
                </motion.div>
              )}
            </div>

            {/* Wishlist Button (Always visible) */}
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={handleWishlist}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/80 text-secondary-600 hover:bg-white hover:text-primary-500'
                }`}
            >
              <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
            </motion.button>

            {/* Out of Stock Overlay */}
            <AnimatePresence>
              {product.is_out_of_stock && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <span className="px-6 py-3 bg-white/95 text-secondary-900 rounded-xl font-bold shadow-xl">
                    Out of Stock
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            <AnimatePresence>
              {isHovered && !product.is_out_of_stock && (
                <motion.div
                  variants={quickActionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute bottom-0 left-0 right-0 p-4"
                >
                  <div className="flex justify-center gap-2">
                    <motion.button
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${justAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-secondary-900 hover:bg-primary-600 hover:text-white'
                        }`}
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                    <motion.div
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center p-3 bg-white/90 backdrop-blur-sm rounded-xl text-secondary-700 hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Info */}
          <div className="p-4 md:p-5">
            <p className="text-[10px] md:text-xs text-secondary-400 uppercase tracking-widest font-semibold mb-1.5">
              {product.category_name}
            </p>
            <h3 className="font-semibold text-secondary-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 text-sm md:text-base leading-snug">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                ৳{parseFloat(product.price).toLocaleString()}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-secondary-400 line-through font-medium">
                  ৳{parseFloat(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Bottom gradient accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </Link>
    </motion.div>
  );
}
