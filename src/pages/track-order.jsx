import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { ordersAPI } from '@/lib/api';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(router.query.order || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber) {
      toast.error('Please enter order number');
      return;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.trackOrder({
        order_number: orderNumber,
        phone: phone || undefined,
      });
      setOrderData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Order not found');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    if (status === 'cancelled' || status === 'refunded') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentStatusIndex = orderData ? getStatusIndex(orderData.order_status) : -1;

  return (
    <Layout title="Track Order - Zzuhana">
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              Track Your Order
            </h1>
            <p className="text-secondary-600">
              Enter your order number to track your package
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="input"
                  placeholder="e.g., ORD-20240101-ABCDEF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="For verification"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </form>

          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-secondary-500">Order Number</p>
                  <p className="font-semibold text-secondary-900">{orderData.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">Tracking Number</p>
                  <p className="font-semibold text-secondary-900">{orderData.tracking_number}</p>
                </div>
              </div>

              {/* Status Timeline */}
              {orderData.order_status !== 'cancelled' && orderData.order_status !== 'refunded' ? (
                <div className="mb-8">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                      <div 
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {statusSteps.map((step, index) => (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index <= currentStatusIndex 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-secondary-400'
                        }`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          index <= currentStatusIndex ? 'text-primary-600 font-medium' : 'text-secondary-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-red-50 rounded-lg flex items-center">
                  <XCircle className="w-6 h-6 text-red-600 mr-3" />
                  <span className="text-red-800 font-medium">
                    Order {orderData.order_status}
                  </span>
                </div>
              )}

              {/* Status History */}
              {orderData.status_history && orderData.status_history.length > 0 && (
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-4">Order History</h3>
                  <div className="space-y-3">
                    {orderData.status_history.map((history, index) => (
                      <div key={history.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 mt-2 bg-primary-600 rounded-full" />
                        <div className="flex-1">
                          <p className="text-secondary-900 font-medium capitalize">
                            {history.status.replace('_', ' ')}
                          </p>
                          {history.note && (
                            <p className="text-sm text-secondary-600">{history.note}</p>
                          )}
                          <p className="text-xs text-secondary-400">
                            {new Date(history.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-500">Order Date</p>
                  <p className="text-secondary-900 font-medium">
                    {new Date(orderData.created_at).toLocaleDateString()}
                  </p>
                </div>
                {orderData.shipped_at && (
                  <div>
                    <p className="text-secondary-500">Shipped Date</p>
                    <p className="text-secondary-900 font-medium">
                      {new Date(orderData.shipped_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {orderData.delivered_at && (
                  <div>
                    <p className="text-secondary-500">Delivered Date</p>
                    <p className="text-secondary-900 font-medium">
                      {new Date(orderData.delivered_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
