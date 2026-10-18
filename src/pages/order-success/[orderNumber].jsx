import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderNumber } = router.query;

  return (
    <Layout title="Order Confirmed - Pickorbeet">
      <div className="container-custom py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-secondary-600 mb-2">
            Thank you for your order. Your order has been placed successfully.
          </p>
          
          <p className="text-lg font-semibold text-primary-600 mb-8">
            Order Number: {orderNumber}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-secondary-900 mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Order Processing</p>
                  <p className="text-sm text-secondary-600">We'll start preparing your order soon.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Shipping</p>
                  <p className="text-sm text-secondary-600">You'll receive tracking info once shipped.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Delivery</p>
                  <p className="text-sm text-secondary-600">Inside Dhaka: 24 hrs | Outside: 3-5 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/track-order?order=${orderNumber}`} className="btn btn-primary">
              Track Order
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
