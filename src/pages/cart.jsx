import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { fetchCart, updateCartItem, removeFromCart } from '@/store/slices/cartSlice';
import { getMediaUrl } from '@/lib/siteConfig';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalItems, subtotal, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ itemId, quantity: newQuantity }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId))
      .unwrap()
      .then(() => {
        toast.success('Item removed from cart');
      });
  };

  if (loading) {
    return (
      <Layout title="Cart - Pickorbeet">
        <div className="container-custom py-16">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Layout title="Cart - Pickorbeet">
        <div className="container-custom py-16 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-secondary-300 mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold text-secondary-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-secondary-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cart - Pickorbeet">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border"
              >
                {/* Product Image */}
                <Link href={`/product/${item.product}`} className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getMediaUrl(item.product_image, '/images/placeholder.jpg')}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product}`}>
                    <h3 className="font-medium text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2">
                      {item.product_name}
                    </h3>
                  </Link>

                  {(item.size || item.color) && (
                    <p className="text-sm text-secondary-500 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span> | </span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </p>
                  )}

                  <p className="text-primary-600 font-semibold mt-2">
                    ৳{parseFloat(item.unit_price).toLocaleString()}
                  </p>

                  {/* Mobile Quantity & Remove */}
                  <div className="flex items-center justify-between mt-4 md:hidden">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Desktop Quantity */}
                <div className="hidden md:flex items-center border rounded-lg h-fit">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop Total & Remove */}
                <div className="hidden md:flex flex-col items-end justify-between">
                  <p className="font-semibold text-secondary-900">
                    ৳{parseFloat(item.total_price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>৳{parseFloat(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Delivery</span>
                  <span className="text-sm text-secondary-500">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-secondary-900">
                    <span>Subtotal</span>
                    <span className="text-primary-600">
                      ৳{parseFloat(subtotal).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Delivery charge will be added at checkout
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full btn btn-primary flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/products"
                className="block text-center text-primary-600 hover:text-primary-700 mt-4 text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
