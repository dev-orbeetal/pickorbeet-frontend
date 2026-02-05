import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { authAPI } from '@/lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && router.isReady) {
      verifyEmail();
    } else if (router.isReady && !token) {
      setLoading(false);
      setError('No verification token provided');
    }
  }, [token, router.isReady]);

  const verifyEmail = async () => {
    setLoading(true);
    try {
      await authAPI.verifyEmail({ token });
      setSuccess(true);
      toast.success('Email verified successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to verify email';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Verify Email - Zzuhana">
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
          </div>

          <div className="bg-white rounded-2xl shadow-elegant border border-cream-200 p-8 text-center">
            {loading ? (
              <>
                <Loader2 className="w-16 h-16 text-burgundy-600 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                  Verifying Your Email
                </h1>
                <p className="text-charcoal-600">
                  Please wait while we verify your email address...
                </p>
              </>
            ) : success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                  Email Verified!
                </h1>
                <p className="text-charcoal-600 mb-6">
                  Your email has been verified successfully. You can now access all features.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 px-4 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white font-semibold rounded-xl text-center transition-all"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-2">
                  Verification Failed
                </h1>
                <p className="text-charcoal-600 mb-6">
                  {error || 'This verification link is invalid or has expired.'}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="inline-block w-full py-3 px-4 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white font-semibold rounded-xl text-center transition-all"
                  >
                    Sign In
                  </Link>
                  <p className="text-sm text-charcoal-500">
                    Need a new verification link?{' '}
                    <Link href="/login" className="text-burgundy-600 font-semibold hover:text-burgundy-700">
                      Sign in to resend
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
