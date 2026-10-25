import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import Layout from '@/components/layout/Layout';
import AuthShell, { authButtonClass, authInputClass } from '@/components/auth/AuthShell';
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
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      dispatch(fetchCart());
      const redirect = router.query.redirect || '/';
      router.push(redirect);
      toast.success('Welcome back');
    }
  }, [isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (!error) return;
    const errorMessage = typeof error === 'string' ? error : error.detail || error.message || error.error || 'Login failed';
    toast.error(errorMessage);
    dispatch(clearError());
  }, [error, dispatch]);

  const handleGoogleCallback = useCallback(async (response) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    try {
      await dispatch(googleAuth(response.credential)).unwrap();
    } catch {
      // The auth slice shows the server's message.
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch]);

  const initializeGoogle = useCallback(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
    });
    const slot = document.getElementById('google-signin-button');
    if (slot) {
      slot.innerHTML = '';
      window.google.accounts.id.renderButton(slot, {
        theme: 'outline',
        size: 'large',
        width: slot.offsetWidth || 360,
        text: 'continue_with',
        shape: 'pill',
      });
    }
  }, [handleGoogleCallback]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Enter your email and password');
      return;
    }
    dispatch(login(formData));
  };

  return (
    <Layout title="Sign in - PickOrbeet">
      <Script src="https://accounts.google.com/gsi/client" onLoad={initializeGoogle} strategy="lazyOnload" />
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to track orders, save addresses, and check out faster."
        footer={(
          <>
            New to PickOrbeet?{' '}
            <Link href="/register" className="font-semibold text-[#0040EE]">Create an account</Link>
          </>
        )}
      >
        {GOOGLE_CLIENT_ID && (
          <>
            <div className="mb-5 min-h-[44px]">
              {googleLoading ? (
                <div className="flex h-11 items-center justify-center rounded-full border border-[#E3E8F4]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#5C6984]" />
                </div>
              ) : (
                <div id="google-signin-button" className="flex w-full justify-center" />
              )}
            </div>
            <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-wide text-[#98A2BE]">
              <span className="h-px flex-1 bg-[#E6ECF8]" />
              or email
              <span className="h-px flex-1 bg-[#E6ECF8]" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#051340]">Email</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className={authInputClass}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-[#051340]">
              Password
              <Link href="/forgot-password" className="text-xs font-semibold text-[#0040EE]">Forgot?</Link>
            </span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                className={`${authInputClass} pr-12`}
                placeholder="Your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B95B2]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </AuthShell>
    </Layout>
  );
}
