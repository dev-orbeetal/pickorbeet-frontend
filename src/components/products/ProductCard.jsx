import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product_id: product.id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success('Added to cart!');
      })
      .catch((error) => {
        toast.error(error?.error || 'Failed to add to cart');
      });
  };

  const imageUrl = product.primary_image
    ? (product.primary_image.startsWith('http') ? product.primary_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${product.primary_image}`)
    : '/images/placeholder.svg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="card overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Discount Badge */}
            {product.discount_percentage > 0 && (
              <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 text-xs font-semibold rounded">
                -{product.discount_percentage}%
              </div>
            )}

            {/* Out of Stock Badge */}
            {product.is_out_of_stock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-secondary-900 px-4 py-2 rounded-lg font-semibold">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
            >
              <div className="flex justify-center space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.is_out_of_stock}
                  className="p-3 bg-white rounded-full text-secondary-900 hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className={`p-3 rounded-full transition-colors ${isWishlisted
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-secondary-900 hover:bg-primary-600 hover:text-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  className="p-3 bg-white rounded-full text-secondary-900 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">
              {product.category_name}
            </p>
            <h3 className="font-medium text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-primary-600">
                ৳{parseFloat(product.price).toLocaleString()}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-secondary-400 line-through">
                  ৳{parseFloat(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
