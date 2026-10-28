import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import AuthShell, { authButtonClass, authInputClass } from '@/components/auth/AuthShell';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error('Enter your email address');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reset password - PickOrbeet" noindex>
      <AuthShell
        title={sent ? 'Check your email' : 'Reset your password'}
        subtitle={sent
          ? `If an account exists for ${email}, a reset link is on its way.`
          : 'We’ll email you a link to choose a new password.'}
        footer={<Link href="/login" className="inline-flex items-center font-semibold text-[#0040EE]"><ArrowLeft className="mr-1 h-4 w-4" /> Back to sign in</Link>}
      >
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6EC]">
              <CheckCircle className="h-7 w-7 text-[#06892E]" />
            </div>
            <p className="text-sm text-[#5C6984]">Check the inbox and spam folder. The link expires after a while.</p>
            <button type="button" onClick={() => setSent(false)} className="mt-5 text-sm font-semibold text-[#0040EE]">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#051340]">Email</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B95B2]" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={authInputClass} placeholder="you@example.com" required />
              </div>
            </label>
            <button type="submit" disabled={loading} className={authButtonClass}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? 'Sending' : 'Send reset link'}
            </button>
          </form>
        )}
      </AuthShell>
    </Layout>
  );
}
