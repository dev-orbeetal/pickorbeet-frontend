import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import Layout from '@/components/layout/Layout';
import { login, googleAuth, clearError } from '@/store/slices/authSlice';
import { fetchCart } from '@/store/slices/cartSlice';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const hasShownWelcome = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      // Fetch cart after login to merge/show user's cart
      dispatch(fetchCart());
      const redirect = router.query.redirect || '/';
      router.push(redirect);
      toast.success('Welcome back!');
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.detail || error.message || 'Login failed';
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    dispatch(login(formData));
  };

  const handleGoogleCallback = useCallback(async (response) => {
    if (response.credential) {
      setGoogleLoading(true);
      try {
        await dispatch(googleAuth(response.credential)).unwrap();
        // Toast is handled by the isAuthenticated useEffect
      } catch (err) {
        toast.error('Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    }
  }, [dispatch]);

  const initializeGoogle = useCallback(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    }
  }, [handleGoogleCallback]);

  return (
    <Layout title="Login - Zzuhana">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogle}
        strategy="lazyOnload"
      />

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
              Welcome Back
            </h1>
            <p className="mt-2 text-charcoal-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-elegant border border-cream-200 p-8">
            {/* Google Sign-In Button */}
            {GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-6">
                  {googleLoading ? (
                    <div className="w-full h-11 flex items-center justify-center bg-cream-50 rounded-lg border border-cream-200">
                      <Loader2 className="w-5 h-5 animate-spin text-charcoal-500" />
                    </div>
                  ) : (
                    <div id="google-signin-button" className="w-full flex justify-center" />
                  )}
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cream-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-charcoal-500">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 bg-cream-50 border-cream-300 rounded focus:ring-gold-500"
                  />
                  <span className="ml-2 text-sm text-charcoal-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-charcoal-600">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-charcoal-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
