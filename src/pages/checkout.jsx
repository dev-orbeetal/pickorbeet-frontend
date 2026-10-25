import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Truck, User, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import CouponField from '@/components/checkout/CouponField';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { fetchCart } from '@/store/slices/cartSlice';
import { addressAPI, ordersAPI, paymentsAPI } from '@/lib/api';
import { deliveryChargeFor, isInsideDhaka, money } from '@/lib/delivery';
import { getMediaUrl } from '@/lib/siteConfig';

const PAYMENTS = [
  { id: 'bkash', title: 'bKash', detail: 'Pay with bKash', icon: Smartphone },
  { id: 'nagad', title: 'Nagad', detail: 'Pay with Nagad', icon: Smartphone },
  { id: 'card', title: 'Card', detail: 'Debit or credit card', icon: CreditCard },
  { id: 'cod', title: 'Cash on Delivery', detail: 'Pay when you receive your order', icon: Banknote },
];

function rowsOf(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, deliveryInside, deliveryOutside } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  useBootGate(!cartLoaded);
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [coupon, setCoupon] = useState(null);
  const couponBoot = useRef(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_district: '',
    shipping_postal_code: '',
    use_different_billing: false,
    billing_name: '',
    billing_phone: '',
    billing_address_line1: '',
    billing_city: '',
    billing_district: '',
    notes: '',
  });

  const requestedIds = useMemo(() => {
    const raw = router.query.items;
    if (typeof raw !== 'string' || !raw) return null;
    return raw.split(',').filter(Boolean);
  }, [router.query.items]);

  const checkoutItems = useMemo(() => {
    if (!requestedIds) return items || [];
    return (items || []).filter((item) => requestedIds.includes(String(item.id)));
  }, [items, requestedIds]);

  const lineSubtotal = checkoutItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  const deliveryCharge = deliveryChargeFor({
    city: formData.shipping_city,
    district: formData.shipping_district,
    inside: deliveryInside,
    outside: deliveryOutside,
  });
  const discount = coupon?.discount || 0;
  const total = Math.max(0, lineSubtotal - discount) + (deliveryCharge || 0);
  const inside = isInsideDhaka(formData.shipping_city, formData.shipping_district);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    dispatch(fetchCart()).finally(() => setCartLoaded(true));
    return undefined;
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !user) return undefined;
    setFormData((prev) => ({
      ...prev,
      shipping_name: prev.shipping_name || user.full_name || '',
      shipping_phone: prev.shipping_phone || user.phone || '',
      guest_name: user.full_name || '',
      guest_email: user.email || '',
      guest_phone: user.phone || '',
    }));
    let active = true;
    addressAPI.list()
      .then((response) => {
        if (!active) return;
        const rows = rowsOf(response.data);
        setAddresses(rows);
        const preferred = rows.find((row) => row.is_default) || rows[0];
        if (preferred) applyAddress(preferred);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!router.isReady || !cartLoaded || couponBoot.current) return undefined;
    const code = typeof router.query.coupon === 'string' ? router.query.coupon.trim() : '';
    if (!code || lineSubtotal <= 0) return undefined;
    couponBoot.current = true;
    let active = true;
    ordersAPI.validateCoupon({ code, subtotal: lineSubtotal })
      .then((response) => {
        if (!active) return;
        setCoupon({
          code: response.data.coupon.code,
          discount: Number(response.data.discount_amount) || 0,
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [router.isReady, router.query.coupon, cartLoaded, lineSubtotal]);

  useEffect(() => {
    if (!cartLoaded || !router.isReady) return;
    if (checkoutItems.length === 0) router.replace('/cart');
  }, [cartLoaded, router, checkoutItems.length]);

  const applyAddress = (address) => {
    setAddressId(String(address.id));
    setFormData((prev) => ({
      ...prev,
      shipping_name: address.full_name || prev.shipping_name,
      shipping_phone: address.phone || '',
      shipping_address_line1: address.address_line1 || '',
      shipping_address_line2: address.address_line2 || '',
      shipping_city: address.city || '',
      shipping_district: address.district || '',
      shipping_postal_code: address.postal_code || '',
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1 && !isAuthenticated) {
      if (!formData.guest_name || !formData.guest_phone) {
        toast.error('Please fill in your name and phone number');
        return false;
      }
    }
    if (stepNum === 2) {
      if (!formData.shipping_name || !formData.shipping_phone
        || !formData.shipping_address_line1 || !formData.shipping_city
        || !formData.shipping_district) {
        toast.error('Please fill in all required shipping fields');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async (paymentMethod) => {
    if (!validateStep(2)) return;
    setLoading(true);
    try {
      const cleanData = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) cleanData[key] = value;
      });
      cleanData.payment_method = paymentMethod;
      if (coupon?.code) cleanData.coupon_code = coupon.code;
      if (requestedIds) cleanData.item_ids = checkoutItems.map((item) => item.id);
      const response = await ordersAPI.checkout(cleanData);
      const order = response.data.order;
      dispatch(fetchCart());
      if (paymentMethod === 'cod') {
        router.push(`/order-success/${order.order_number}`);
      } else {
        const paymentResponse = await paymentsAPI.initiatePayment({ order_id: order.id });
        if (paymentResponse.data.payment_url) {
          window.location.href = paymentResponse.data.payment_url;
        } else {
          toast.error('Failed to initiate payment');
        }
      }
    } catch (error) {
      const data = error.response?.data;
      const message = data?.error || data?.detail || data?.payment_method?.[0] || 'Checkout failed';
      toast.error(typeof message === 'string' ? message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cartLoaded) {
    return (
      <Layout title="Checkout - Pickorbeet">
        <div className="container-custom py-16" aria-busy="true" aria-label="Loading checkout">
          <div className="space-y-6">
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (checkoutItems.length === 0) return null;

  return (
    <Layout title="Checkout - Pickorbeet">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">Checkout</h1>

        <div className="flex items-center justify-center mb-12">
          {[
            { num: 1, label: 'Information', icon: User },
            { num: 2, label: 'Shipping', icon: Truck },
            { num: 3, label: 'Payment', icon: CreditCard },
          ].map((item, index) => (
            <div key={item.num} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= item.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-secondary-500'}`}>
                {step > item.num ? <CheckCircle className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= item.num ? 'text-primary-600' : 'text-secondary-500'}`}>
                {item.label}
              </span>
              {index < 2 && <div className={`w-16 h-1 mx-4 rounded ${step > item.num ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">Contact Information</h2>
                  {!isAuthenticated && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name *</label>
                        <input type="text" name="guest_name" value={formData.guest_name} onChange={handleChange} className="input" placeholder="Enter your full name" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Phone *</label>
                          <input type="tel" name="guest_phone" value={formData.guest_phone} onChange={handleChange} className="input" placeholder="01XXXXXXXXX" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Email (Optional)</label>
                          <input type="email" name="guest_email" value={formData.guest_email} onChange={handleChange} className="input" placeholder="your@email.com" />
                        </div>
                      </div>
                    </div>
                  )}
                  {isAuthenticated && (
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-primary-800">Logged in as <strong>{user?.email}</strong></p>
                    </div>
                  )}
                  <button type="button" onClick={nextStep} className="mt-6 btn btn-primary w-full">Continue to Shipping</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    {isAuthenticated && addresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Saved addresses</label>
                        <div className="space-y-2">
                          {addresses.map((address) => (
                            <label
                              key={address.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 ${addressId === String(address.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                            >
                              <input
                                type="radio"
                                name="saved_address"
                                checked={addressId === String(address.id)}
                                onChange={() => applyAddress(address)}
                                className="mt-1"
                              />
                              <span className="text-sm text-secondary-800">
                                <span className="font-medium">{address.label || address.full_name}</span>
                                {address.is_default ? ' · Default' : ''}
                                <span className="mt-1 block text-secondary-600">
                                  {address.address_line1}, {address.city}
                                  {address.district ? `, ${address.district}` : ''}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name *</label>
                        <input type="text" name="shipping_name" value={formData.shipping_name} onChange={handleChange} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Phone *</label>
                        <input type="tel" name="shipping_phone" value={formData.shipping_phone} onChange={handleChange} className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Address Line 1 *</label>
                      <input type="text" name="shipping_address_line1" value={formData.shipping_address_line1} onChange={handleChange} className="input" placeholder="House/Building, Road, Area" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Address Line 2</label>
                      <input type="text" name="shipping_address_line2" value={formData.shipping_address_line2} onChange={handleChange} className="input" placeholder="Apartment, Suite, etc. (Optional)" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">City *</label>
                        <input type="text" name="shipping_city" value={formData.shipping_city} onChange={handleChange} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">District *</label>
                        <input type="text" name="shipping_district" value={formData.shipping_district} onChange={handleChange} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Postal Code</label>
                        <input type="text" name="shipping_postal_code" value={formData.shipping_postal_code} onChange={handleChange} className="input" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-cream-300 bg-cream-50 p-3 text-sm text-secondary-700">
                      <p className="font-medium text-secondary-900">Delivery charge</p>
                      {deliveryCharge == null ? (
                        <p className="mt-1">Enter a city to see the charge for this order.</p>
                      ) : (
                        <p className="mt-1">{inside ? 'Inside Dhaka' : 'Outside Dhaka'} · ৳{money(deliveryCharge)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Order Notes (Optional)</label>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} className="input" rows={3} placeholder="Any special instructions for delivery..." />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">Back</button>
                    <button type="button" onClick={nextStep} className="btn btn-primary flex-1">Continue to Payment</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    {PAYMENTS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handleSubmit(method.id)}
                        disabled={loading}
                        className="w-full p-4 border-2 rounded-xl hover:border-primary-600 transition-colors text-left flex items-center disabled:opacity-60"
                      >
                        <method.icon className="w-8 h-8 text-primary-600 mr-4" />
                        <div>
                          <p className="font-semibold text-secondary-900">{method.title}</p>
                          <p className="text-sm text-secondary-500">{method.detail}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="mt-6 btn btn-secondary w-full" disabled={loading}>Back</button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={getMediaUrl(item.product_image, '/images/placeholder.jpg')} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 line-clamp-1">{item.product_name}</p>
                      <p className="text-xs text-secondary-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary-600">৳{money(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <CouponField
                  subtotal={lineSubtotal}
                  coupon={coupon}
                  onApply={setCoupon}
                  onClear={() => setCoupon(null)}
                />
              </div>
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>৳{money(lineSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon</span>
                    <span>−৳{money(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary-600">
                  <span>Delivery{deliveryCharge == null ? '' : inside ? ' (Inside Dhaka)' : ' (Outside Dhaka)'}</span>
                  <span>{deliveryCharge == null ? 'Add a city' : `৳${money(deliveryCharge)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-secondary-900 border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary-600">৳{money(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

CheckoutPage.getInitialProps = () => ({ props: {} });
