import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { authAPI } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = () => {
    const { new_password } = formData;
    if (!new_password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (new_password.length >= 8) strength++;
    if (new_password.match(/[a-z]/)) strength++;
    if (new_password.match(/[A-Z]/)) strength++;
    if (new_password.match(/[0-9]/)) strength++;
    if (new_password.match(/[^a-zA-Z0-9]/)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    return { strength: 4, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const { strength, label, color } = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token && router.isReady) {
    return (
      <Layout title="Reset Password - Zzuhana">
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-charcoal-800 mb-2">Invalid Reset Link</h1>
            <p className="text-charcoal-600 mb-6">This password reset link is invalid or has expired.</p>
            <Link
              href="/forgot-password"
              className="inline-block py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reset Password - Zzuhana">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/images/logo.png" alt="Zzuhana" className="h-16 mx-auto" />
            </Link>
            <h1 className="mt-6 text-2xl font-display font-bold text-charcoal-800">
              {success ? 'Password Reset!' : 'Create New Password'}
            </h1>
            <p className="mt-2 text-charcoal-600">
              {success
                ? 'Your password has been reset successfully'
                : 'Enter your new password below'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-elegant border border-cream-200 p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-charcoal-600 mb-6">
                  You can now sign in with your new password.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl text-center transition-all"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.new_password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${level <= strength ? color : 'bg-cream-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-charcoal-500">{label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="new_password_confirm"
                      value={formData.new_password_confirm}
                      onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                    {formData.new_password_confirm && formData.new_password === formData.new_password_confirm && (
                      <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
