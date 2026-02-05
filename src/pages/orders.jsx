import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Search, Filter, ShoppingBag, Truck, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { ordersAPI } from '@/lib/api';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const response = await ordersAPI.getOrder(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const matchesSearch = !searchQuery ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) return null;

  return (
    <Layout title="My Orders - Zzuhana">
      <div className="container-custom py-8 max-w-5xl">
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Order Detail View */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center gap-2 text-charcoal-600 hover:text-burgundy-600 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>

              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-800 px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Order #{selectedOrder.order_number}</h2>
                      <p className="text-burgundy-200 text-sm mt-0.5">
                        Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusConfig[selectedOrder.order_status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusConfig[selectedOrder.order_status]?.label || selectedOrder.order_status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-charcoal-800 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-charcoal-800">{item.product_name}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-charcoal-500 mt-1">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <p className="font-semibold text-burgundy-600">
                            ৳{parseFloat(item.total_price || item.unit_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-charcoal-800 mb-3">Shipping Address</h3>
                      <div className="text-sm text-charcoal-600 space-y-1 bg-cream-50 rounded-xl p-4">
                        <p className="font-medium text-charcoal-800">{selectedOrder.shipping_name}</p>
                        <p>{selectedOrder.shipping_phone}</p>
                        <p>{selectedOrder.shipping_address_line1}</p>
                        {selectedOrder.shipping_address_line2 && <p>{selectedOrder.shipping_address_line2}</p>}
                        <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_district}</p>
                        {selectedOrder.shipping_postal_code && <p>{selectedOrder.shipping_postal_code}</p>}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-charcoal-800 mb-3">Payment Summary</h3>
                      <div className="bg-cream-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-charcoal-600">
                          <span>Subtotal</span>
                          <span>৳{parseFloat(selectedOrder.subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-charcoal-600">
                          <span>Delivery</span>
                          <span>৳{parseFloat(selectedOrder.delivery_charge || 0).toLocaleString()}</span>
                        </div>
                        {parseFloat(selectedOrder.discount || 0) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-৳{parseFloat(selectedOrder.discount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-charcoal-800 border-t pt-2 mt-2">
                          <span>Total</span>
                          <span className="text-burgundy-600">৳{parseFloat(selectedOrder.total).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-charcoal-500 pt-1">
                          <span>Payment</span>
                          <span className="capitalize">{selectedOrder.payment_method || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-charcoal-500">
                          <span>Payment Status</span>
                          <span className="capitalize">{selectedOrder.payment_status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {selectedOrder.status_history?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-charcoal-800 mb-3">Order Timeline</h3>
                      <div className="space-y-3">
                        {selectedOrder.status_history.map((entry, i) => (
                          <div key={entry.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-burgundy-500' : 'bg-charcoal-300'}`} />
                              {i < selectedOrder.status_history.length - 1 && <div className="w-0.5 h-full bg-charcoal-200 mt-1" />}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-medium text-charcoal-800 capitalize">{entry.status.replace('_', ' ')}</p>
                              {entry.note && <p className="text-xs text-charcoal-500 mt-0.5">{entry.note}</p>}
                              <p className="text-xs text-charcoal-400 mt-0.5">
                                {new Date(entry.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold text-charcoal-800 mb-2">Order Notes</h3>
                      <p className="text-sm text-charcoal-600 bg-cream-50 rounded-xl p-4">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-display font-bold text-charcoal-900">My Orders</h1>
                <button
                  onClick={() => router.push('/account')}
                  className="text-sm text-burgundy-600 hover:text-burgundy-700 font-medium"
                >
                  Back to Account
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order number..."
                    className="input pl-10 text-sm"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        filterStatus === status
                          ? 'bg-burgundy-600 text-white'
                          : 'bg-white border text-charcoal-600 hover:bg-cream-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl border p-5">
                      <div className="flex justify-between mb-3">
                        <div className="h-5 bg-gray-200 rounded w-32" />
                        <div className="h-5 bg-gray-200 rounded w-20" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-48" />
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border">
                  <ShoppingBag className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-charcoal-700 mb-2">
                    {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
                  </h2>
                  <p className="text-charcoal-500 mb-6">
                    {orders.length === 0
                      ? "You haven't placed any orders yet."
                      : 'Try adjusting your search or filter.'}
                  </p>
                  {orders.length === 0 && (
                    <button onClick={() => router.push('/products')} className="btn btn-primary">
                      Start Shopping
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order, index) => {
                    const config = statusConfig[order.order_status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => fetchOrderDetail(order.id)}
                        className="w-full bg-white rounded-xl border p-5 hover:border-burgundy-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal-800">#{order.order_number}</p>
                              <p className="text-sm text-charcoal-500">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-burgundy-600">৳{parseFloat(order.total).toLocaleString()}</p>
                              <p className="text-xs text-charcoal-500">{order.item_count} item(s)</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                              {config.label}
                            </span>
                            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-burgundy-600 transition-colors" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
