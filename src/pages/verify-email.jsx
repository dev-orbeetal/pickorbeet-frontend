import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { authAPI } from '@/lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { email } = router.query;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = async (otpCode) => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyEmail({ email, otp_code: otpCode });

      // Store tokens
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }

      setSuccess(true);
      toast.success('Email verified successfully! 🎉');

      // Redirect after showing success
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid verification code';
      setError(errorMsg);
      toast.error(errorMsg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResending(true);
    try {
      await authAPI.resendVerification({ email });
      toast.success('New verification code sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (!email && router.isReady) {
    return (
      <Layout title="Verify Email - Pickorbeet">
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-charcoal-800 mb-2">Email Required</h1>
            <p className="text-charcoal-600 mb-6">Please register first to verify your email.</p>
            <Link
              href="/register"
              className="inline-block py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Register Now
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Verify Email - Pickorbeet">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/images/logo.png" alt="Pickorbeet" className="h-16 mx-auto" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-elegant border border-cream-200 p-8">
            {success ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                  Email Verified! 🎉
                </h1>
                <p className="text-charcoal-600 mb-4">
                  Welcome to Pickorbeet! Your account is now active.
                </p>
                <p className="text-sm text-charcoal-500">
                  Redirecting you to homepage...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary-600" />
                  </div>
                  <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-charcoal-600">
                    We sent a 6-digit code to<br />
                    <strong className="text-charcoal-800">{email}</strong>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal-700 mb-3 text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 ${error
                          ? 'border-red-300 bg-red-50'
                          : 'border-cream-200 bg-cream-50 focus:border-primary-500'
                          } disabled:opacity-50`}
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="mt-3 text-center text-sm text-red-600">{error}</p>
                  )}
                </div>

                <button
                  onClick={() => verifyOtp(otp.join(''))}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-charcoal-500 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resending || countdown > 0}
                    className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-cream-200 text-center">
                  <Link
                    href="/register"
                    className="text-sm text-charcoal-500 hover:text-charcoal-700"
                  >
                    Wrong email? <span className="text-primary-600 font-semibold">Go back</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
