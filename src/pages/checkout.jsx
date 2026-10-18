import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, User, Phone, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { fetchCart, clearCart } from '@/store/slices/cartSlice';
import { ordersAPI, paymentsAPI } from '@/lib/api';
import { getMediaUrl } from '@/lib/siteConfig';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, subtotal, loading: cartLoading } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
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

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      dispatch(fetchCart()).finally(() => setCartLoaded(true));
      ordersAPI.getDeliveryOptions().then(res => {
        const opts = res.data?.results || res.data || [];
        setDeliveryOptions(opts);
        if (opts.length > 0) setSelectedDeliveryOption(opts[0]);
      }).catch(() => { });
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        shipping_name: user.full_name || '',
        shipping_phone: user.phone || '',
        guest_name: user.full_name || '',
        guest_email: user.email || '',
        guest_phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const deliveryCharge = selectedDeliveryOption ? parseFloat(selectedDeliveryOption.charge) : 0;
  const total = parseFloat(subtotal) + deliveryCharge;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!isAuthenticated) {
        if (!formData.guest_name || !formData.guest_phone) {
          toast.error('Please fill in your name and phone number');
          return false;
        }
      }
    }
    if (stepNum === 2) {
      if (!formData.shipping_name || !formData.shipping_phone ||
        !formData.shipping_address_line1 || !formData.shipping_city ||
        !formData.shipping_district) {
        toast.error('Please fill in all required shipping fields');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (paymentMethod) => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      // Clean data - remove empty optional fields to avoid validation errors
      const cleanData = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanData[key] = value;
        }
      });
      cleanData.payment_method = paymentMethod;
      const response = await ordersAPI.checkout(cleanData);
      const order = response.data.order;

      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        router.push(`/order-success/${order.order_number}`);
      } else {
        // SSLCommerz payment
        const paymentResponse = await paymentsAPI.initiatePayment({ order_id: order.id });
        if (paymentResponse.data.payment_url) {
          window.location.href = paymentResponse.data.payment_url;
        } else {
          toast.error('Failed to initiate payment');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while cart is being fetched
  if (!cartLoaded || cartLoading) {
    return (
      <Layout title="Checkout - Pickorbeet">
        <div className="container-custom py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!items || items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <Layout title="Checkout - Pickorbeet">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { num: 1, label: 'Information', icon: User },
            { num: 2, label: 'Shipping', icon: Truck },
            { num: 3, label: 'Payment', icon: CreditCard },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-secondary-500'
                  }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-primary-600' : 'text-secondary-500'
                }`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-16 h-1 mx-4 rounded ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Contact Information
                  </h2>

                  {!isAuthenticated && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="guest_name"
                          value={formData.guest_name}
                          onChange={handleChange}
                          className="input"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="guest_phone"
                            value={formData.guest_phone}
                            onChange={handleChange}
                            className="input"
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            name="guest_email"
                            value={formData.guest_email}
                            onChange={handleChange}
                            className="input"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-primary-800">
                        Logged in as <strong>{user?.email}</strong>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={nextStep}
                    className="mt-6 btn btn-primary w-full"
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Shipping Address
                  </h2>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="shipping_name"
                          value={formData.shipping_name}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="shipping_phone"
                          value={formData.shipping_phone}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="shipping_address_line1"
                        value={formData.shipping_address_line1}
                        onChange={handleChange}
                        className="input"
                        placeholder="House/Building, Road, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="shipping_address_line2"
                        value={formData.shipping_address_line2}
                        onChange={handleChange}
                        className="input"
                        placeholder="Apartment, Suite, etc. (Optional)"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="shipping_city"
                          value={formData.shipping_city}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          District *
                        </label>
                        <input
                          type="text"
                          name="shipping_district"
                          value={formData.shipping_district}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="shipping_postal_code"
                          value={formData.shipping_postal_code}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="input"
                        rows={3}
                        placeholder="Any special instructions for delivery..."
                      />
                    </div>

                    {/* Delivery Option Selection */}
                    {deliveryOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          <Truck className="w-4 h-4 inline mr-1" />
                          Delivery Option *
                        </label>
                        <div className="space-y-2">
                          {deliveryOptions.map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedDeliveryOption?.id === opt.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="delivery_option"
                                  checked={selectedDeliveryOption?.id === opt.id}
                                  onChange={() => setSelectedDeliveryOption(opt)}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="font-medium text-secondary-800">{opt.name}</span>
                              </div>
                              <span className="font-semibold text-primary-700">৳{parseFloat(opt.charge).toLocaleString()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="btn btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="btn btn-primary flex-1"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleSubmit('online')}
                      disabled={loading}
                      className="w-full p-4 border-2 rounded-xl hover:border-primary-600 transition-colors text-left flex items-center"
                    >
                      <CreditCard className="w-8 h-8 text-primary-600 mr-4" />
                      <div>
                        <p className="font-semibold text-secondary-900">Pay Online</p>
                        <p className="text-sm text-secondary-500">
                          bKash, Nagad, Card, Mobile Banking
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSubmit('cod')}
                      disabled={loading}
                      className="w-full p-4 border-2 rounded-xl hover:border-primary-600 transition-colors text-left flex items-center"
                    >
                      <Truck className="w-8 h-8 text-primary-600 mr-4" />
                      <div>
                        <p className="font-semibold text-secondary-900">Cash on Delivery</p>
                        <p className="text-sm text-secondary-500">
                          Pay when you receive your order
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="mt-6 btn btn-secondary w-full"
                    disabled={loading}
                  >
                    Back
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getMediaUrl(item.product_image, '/images/placeholder.jpg')}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-secondary-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary-600">
                        ৳{parseFloat(item.total_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>৳{parseFloat(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Delivery{selectedDeliveryOption ? ` (${selectedDeliveryOption.name})` : ''}</span>
                  <span>৳{deliveryCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-secondary-900 border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary-600">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Prevent static generation
CheckoutPage.getInitialProps = () => {
  return { props: {} };
};
