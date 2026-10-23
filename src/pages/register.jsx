import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import Layout from '@/components/layout/Layout';
import AuthShell, { authButtonClass, authInputClass } from '@/components/auth/AuthShell';
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
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (pendingVerification?.requires_verification && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
      toast.success('Check your email for the 6-digit code');
    }
  }, [pendingVerification, router]);

  useEffect(() => {
    if (!error) return;
    const errorMsg = typeof error === 'object'
      ? Object.entries(error).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ')
      : error;
    toast.error(errorMsg || 'Registration failed');
    dispatch(clearError());
  }, [error, dispatch]);

  const strength = (() => {
    const password = formData.password;
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  })();

  const handleGoogleCallback = useCallback(async (response) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    try {
      await dispatch(googleAuth(response.credential)).unwrap();
    } catch {
      toast.error('Google sign-up failed');
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
    const slot = document.getElementById('google-signup-button');
    if (!slot) return;
    slot.innerHTML = '';
    window.google.accounts.id.renderButton(slot, {
      theme: 'outline',
      size: 'large',
      width: slot.offsetWidth || 360,
      text: 'signup_with',
      shape: 'pill',
    });
  }, [handleGoogleCallback]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!agreeTerms) {
      toast.error('Please agree to the Terms and Privacy Policy');
      return;
    }
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Use at least 8 characters');
      return;
    }
    dispatch(register(formData));
  };

  const setField = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  return (
    <Layout title="Create account - PickOrbeet">
      <Script src="https://accounts.google.com/gsi/client" onLoad={initializeGoogle} strategy="lazyOnload" />
      <AuthShell
        title="Create your account"
        subtitle="It takes a minute. We’ll email you a 6-digit code to confirm it’s you."
        footer={(
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#0040EE]">Sign in</Link>
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
                <div id="google-signup-button" className="flex w-full justify-center" />
              )}
            </div>
            <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-wide text-[#98A2BE]">
              <span className="h-px flex-1 bg-[#E6ECF8]" />
              or email
              <span className="h-px flex-1 bg-[#E6ECF8]" />
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#051340]">First name</span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
                <input name="first_name" value={formData.first_name} onChange={setField} className={authInputClass} placeholder="Rakibul" required />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#051340]">Last name</span>
              <input name="last_name" value={formData.last_name} onChange={setField} className={`${authInputClass} pl-4`} placeholder="Hasan" required />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#051340]">Email</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input type="email" name="email" autoComplete="email" value={formData.email} onChange={setField} className={authInputClass} placeholder="you@example.com" required />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#051340]">Phone <span className="font-normal text-[#98A2BE]">optional</span></span>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input type="tel" name="phone" value={formData.phone} onChange={setField} className={authInputClass} placeholder="01XXXXXXXXX" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#051340]">Password</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={setField}
                className={`${authInputClass} pr-12`}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B95B2]" aria-label="Toggle password">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <span key={level} className={`h-1 flex-1 rounded-full ${level <= strength ? 'bg-[#06892E]' : 'bg-[#E6ECF8]'}`} />
                ))}
              </div>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#051340]">Confirm password</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirm"
                value={formData.password_confirm}
                onChange={setField}
                className={authInputClass}
                placeholder="Repeat password"
                required
              />
              {formData.password_confirm && formData.password === formData.password_confirm && (
                <CheckCircle className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#06892E]" />
              )}
            </div>
          </label>
          <label className="flex items-start gap-2.5 pt-1 text-sm text-[#5C6984]">
            <input type="checkbox" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} className="mt-1" />
            <span>
              I agree to the <Link href="/terms" className="font-semibold text-[#0040EE]">Terms</Link> and{' '}
              <Link href="/privacy" className="font-semibold text-[#0040EE]">Privacy Policy</Link>
            </span>
          </label>
          <button type="submit" disabled={loading || !agreeTerms} className={authButtonClass}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Creating account' : 'Create account'}
          </button>
        </form>
      </AuthShell>
    </Layout>
  );
}
