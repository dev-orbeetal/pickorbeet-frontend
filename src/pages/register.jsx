import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import Layout from '@/components/layout/Layout';
import { register, googleAuth, clearError } from '@/store/slices/authSlice';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, pendingVerification } = useSelector((state) => state.auth);
  const hasRedirected = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Redirect to verify email page after registration
    if (pendingVerification?.requires_verification && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
      toast.success('Please check your email for verification code!');
    }
  }, [pendingVerification]);

  useEffect(() => {
    if (error) {
      let errorMsg = 'Registration failed';
      if (typeof error === 'object') {
        errorMsg = Object.entries(error)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      toast.error(errorMsg);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    dispatch(register(formData));
  };

  const handleGoogleCallback = useCallback(async (response) => {
    if (response.credential) {
      setGoogleLoading(true);
      try {
        await dispatch(googleAuth(response.credential)).unwrap();
        // Redirect handled by isAuthenticated effect
      } catch (err) {
        toast.error('Google sign-up failed');
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
        document.getElementById('google-signup-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signup_with',
          shape: 'rectangular',
        }
      );
    }
  }, [handleGoogleCallback]);

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    return { strength: 4, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const { strength, label, color } = passwordStrength();

  return (
    <Layout title="Register - Zzuhana">
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
              Create Account
            </h1>
            <p className="mt-2 text-charcoal-600">
              Join us for exclusive offers and faster checkout
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-elegant border border-cream-200 p-8">
            {/* Google Sign-Up Button */}
            {GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-6">
                  {googleLoading ? (
                    <div className="w-full h-11 flex items-center justify-center bg-cream-50 rounded-lg border border-cream-200">
                      <Loader2 className="w-5 h-5 animate-spin text-charcoal-500" />
                    </div>
                  ) : (
                    <div id="google-signup-button" className="w-full flex justify-center" />
                  )}
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cream-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-charcoal-500">or register with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

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
                  Phone Number <span className="text-charcoal-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="01XXXXXXXXX"
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${level <= strength ? color : 'bg-cream-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-charcoal-500">{label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-xl text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                  {formData.password_confirm && formData.password === formData.password_confirm && (
                    <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <div className="flex items-start pt-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-burgundy-600 bg-cream-50 border-cream-300 rounded focus:ring-gold-500"
                />
                <span className="ml-2.5 text-sm text-charcoal-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-burgundy-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-burgundy-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full py-3 px-4 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white font-semibold rounded-xl shadow-lg shadow-burgundy-500/25 hover:shadow-burgundy-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-charcoal-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-burgundy-600 font-semibold hover:text-burgundy-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
