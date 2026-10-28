import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { useBootGate } from '@/components/loading/LoadingProvider';
import CouponField from '@/components/checkout/CouponField';
import { fetchCart, updateCartItem, removeFromCart } from '@/store/slices/cartSlice';
import { money } from '@/lib/delivery';
import { optionParts } from '@/lib/productOptions';
import { getMediaUrl } from '@/lib/siteConfig';

function optionLine(item) {
  return optionParts(item).join(' | ');
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalItems, loading, deliveryInside, deliveryOutside } = useSelector((state) => state.cart);
  const [pendingBoot, setPendingBoot] = useState(true);
  const [selected, setSelected] = useState(null);
  const [coupon, setCoupon] = useState(null);
  useBootGate(pendingBoot && (!items || items.length === 0));

  const selectedIds = !items?.length
    ? []
    : (selected === null ? items.map((item) => item.id) : selected.filter((id) => items.some((item) => item.id === id)));
  const selectedItems = (items || []).filter((item) => selectedIds.includes(item.id));
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);

  useEffect(() => {
    dispatch(fetchCart()).finally(() => setPendingBoot(false));
  }, [dispatch]);

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;
    const stock = Number(item.stock_quantity);
    const next = Number.isFinite(stock) && stock > 0 ? Math.min(stock, newQuantity) : newQuantity;
    dispatch(updateCartItem({ itemId: item.id, quantity: next }));
  };

  const toggleItem = (itemId) => {
    const next = selectedIds.includes(itemId)
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId];
    setSelected(next);
    setCoupon(null);
  };

  const checkout = () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one item');
      return;
    }
    const params = new URLSearchParams();
    if (selectedIds.length !== items.length) params.set('items', selectedIds.join(','));
    if (coupon?.code) params.set('coupon', coupon.code);
    const query = params.toString();
    router.push(query ? `/checkout?${query}` : '/checkout');
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId))
      .unwrap()
      .then(() => {
        toast.success('Item removed from cart');
      });
  };

  if ((loading || pendingBoot) && (!items || items.length === 0)) {
    return (
      <Layout title="Cart - PickOrbeet" noindex>
        <div className="container-custom py-16" aria-busy="true" aria-label="Loading cart">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Layout title="Cart - PickOrbeet" noindex>
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
    <Layout title="Cart - PickOrbeet" noindex>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <input
                type="checkbox"
                checked={selectedIds.length === items.length}
                onChange={() => {
                  setSelected(selectedIds.length === items.length ? [] : items.map((item) => item.id));
                  setCoupon(null);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              Select all
            </label>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  aria-label={`Select ${item.product_name}`}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600"
                />
                <Link href={`/product/${item.product_slug || item.product}`} className="flex-shrink-0">
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
                  <Link href={`/product/${item.product_slug || item.product}`}>
                    <h3 className="font-medium text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2">
                      {item.product_name}
                    </h3>
                  </Link>

                  {optionLine(item) && (
                    <p className="text-sm text-secondary-500 mt-1">{optionLine(item)}</p>
                  )}

                  <p className="text-primary-600 font-semibold mt-2">
                    ৳{parseFloat(item.unit_price).toLocaleString()}
                  </p>

                  {/* Mobile Quantity & Remove */}
                  <div className="flex items-center justify-between mt-4 md:hidden">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
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
                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
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
                  <span>Selected ({selectedIds.length})</span>
                  <span>৳{money(selectedSubtotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon</span>
                    <span>−৳{money(coupon.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary-600">
                  <span>Delivery</span>
                  <span className="text-right text-sm text-secondary-500">
                    Inside Dhaka ৳{money(deliveryInside)}
                    <br />
                    Outside Dhaka ৳{money(deliveryOutside)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <CouponField
                  subtotal={selectedSubtotal}
                  coupon={coupon}
                  onApply={setCoupon}
                  onClear={() => setCoupon(null)}
                />
              </div>

              <button
                type="button"
                onClick={checkout}
                disabled={selectedIds.length === 0}
                className="w-full btn btn-primary flex items-center justify-center disabled:opacity-50"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

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
