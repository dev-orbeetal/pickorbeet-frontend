import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Save, X, ShieldCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { logout, getProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile(formData);
      dispatch(getProfile());
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('You have been logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <Layout title="My Account - Zzuhana">
      <div className="container-custom py-8 max-w-4xl">
        <h1 className="text-3xl font-display font-bold text-charcoal-900 mb-8">My Account</h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-800 px-6 py-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-2xl font-bold text-white">
                  {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.full_name || 'User'}</h2>
                <p className="text-burgundy-200 text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
                {user?.date_joined && (
                  <p className="text-burgundy-200 text-xs flex items-center gap-1.5 mt-1">
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
                <User className="w-5 h-5 text-burgundy-600" />
                Personal Information
              </h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-burgundy-600 hover:bg-burgundy-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); if (user) setFormData({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', address: user.address || '', city: user.city || '', postal_code: user.postal_code || '' }); }}
                    className="flex items-center gap-1 px-3 py-2 text-charcoal-600 hover:bg-cream-100 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-burgundy-600 text-white rounded-lg hover:bg-burgundy-700 disabled:opacity-50 transition-colors text-sm font-medium"
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
                    className="input bg-cream-50 text-charcoal-500 pr-10"
                  />
                  {user?.is_verified && (
                    <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
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
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.push('/orders')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-burgundy-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-burgundy-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-burgundy-100 transition-colors">
              <MapPin className="w-5 h-5 text-burgundy-600" />
            </div>
            <h3 className="font-medium text-charcoal-800">My Orders</h3>
            <p className="text-sm text-charcoal-500 mt-1">View your order history</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => router.push('/forgot-password')}
            className="bg-white rounded-xl shadow-sm border p-5 hover:border-burgundy-300 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-burgundy-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-burgundy-100 transition-colors">
              <ShieldCheck className="w-5 h-5 text-burgundy-600" />
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
