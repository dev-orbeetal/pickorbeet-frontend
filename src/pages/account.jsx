import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Save, X, ShieldCheck, Calendar, Copy, Ticket, Bell, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProfilePhoto from '@/components/account/ProfilePhoto';
import { logout, getProfile } from '@/store/slices/authSlice';
import { useProfileForm } from '@/lib/profileForm';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const form = useProfileForm(user, () => dispatch(getProfile()));
  const { editing, loading, formData, setFormData, photoFile, photoRemoved } = form;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('You have been logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <Layout title="My Account - Pickorbeet" noindex>
      <div className="container-custom py-8 max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-display font-bold text-charcoal-900">My Account</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/addresses"
              className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FF] px-4 py-2 text-sm font-semibold text-[#0040EE]"
            >
              <MapPin className="h-4 w-4" />
              Delivery addresses
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-full bg-[#FFF1E6] px-4 py-2 text-sm font-semibold text-[#E86E00]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
            <div className="flex items-center gap-5">
              <ProfilePhoto
                name={user?.full_name}
                imageUrl={user?.avatar}
                editing={editing}
                pendingFile={photoFile}
                removed={photoRemoved}
                onSelect={form.onSelectPhoto}
                onRemove={form.onRemovePhoto}
                variant="light"
              />
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.full_name || 'User'}</h2>
                <p className="text-primary-200 text-sm flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
                {user?.date_joined && (
                  <p className="text-primary-200 text-xs flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              {!editing ? (
                <button
                  onClick={form.beginEdit}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={form.cancelEdit}
                    className="flex items-center gap-1 px-3 py-2 text-charcoal-600 hover:bg-cream-100 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={form.save}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="Your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-cream-50 text-charcoal-500 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user?.email || '');
                        toast.success('Email copied to clipboard');
                      }}
                      className="p-1.5 hover:bg-cream-200 rounded transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-3.5 h-3.5 text-charcoal-400" />
                    </button>
                    {user?.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="House, Road, Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  disabled={!editing}
                  className="input disabled:bg-cream-50 disabled:text-charcoal-500"
                  placeholder="1234"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.push('/orders')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-primary-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">My Orders</h3>
            <p className="text-sm text-charcoal-500 mt-1">View your order history</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            onClick={() => router.push('/vouchers')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-primary-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <Ticket className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">My Vouchers</h3>
            <p className="text-sm text-charcoal-500 mt-1">View available offers</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            onClick={() => router.push('/notifications')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-primary-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">Notifications</h3>
            <p className="text-sm text-charcoal-500 mt-1">Orders, offers and account updates</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => router.push('/forgot-password')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-primary-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">Change Password</h3>
            <p className="text-sm text-charcoal-500 mt-1">Update your password</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-red-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">Logout</h3>
            <p className="text-sm text-charcoal-500 mt-1">Sign out of your account</p>
          </motion.button>
        </div>
      </div>
    </Layout>
  );
}
