import { motion } from 'framer-motion';
import { ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const steps = [
  'Send an email to support@pickorbeet.com from the email address on the account.',
  'Use the subject line “Delete my PickOrbeet account”.',
  'Include the full name and phone number on the account so we can match it.',
  'We confirm the request and delete the account. This usually takes up to 30 days.',
];

export default function DeleteAccountPage() {
  return (
    <Layout
      title="Delete your PickOrbeet account"
      description="How to request deletion of your PickOrbeet account and what personal data is deleted or kept."
    >
      <section className="relative bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-950 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="container-custom relative">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-cream-400 mb-6"
          >
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cream-200">Delete account</span>
          </motion.nav>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Delete your PickOrbeet account
            </h1>
            <p className="text-xl text-cream-200 leading-relaxed">
              PickOrbeet customers can ask us to delete their account and the personal data stored with it.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-cream-50">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 md:p-12 space-y-10 text-charcoal-700 leading-relaxed">
            <div id="how-to-request">
              <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-4">How to request deletion</h2>
              <ol className="list-decimal pl-5 space-y-3">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href="mailto:support@pickorbeet.com?subject=Delete%20my%20PickOrbeet%20account"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email support@pickorbeet.com
              </a>
            </div>

            <div id="data-deleted">
              <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-4">Data we delete</h2>
              <p>
                After the request is completed, PickOrbeet deletes the account profile, saved addresses, wishlist, sign-in details, and the phone’s notification registration.
              </p>
            </div>

            <div id="data-kept">
              <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-4">Data we keep</h2>
              <p>
                Order and payment records are kept where we need them for accounting, delivery disputes, and legal obligations. Those records are not used to operate the deleted account.
              </p>
            </div>

            <p className="text-sm text-charcoal-500">
              Questions about this page are covered in the <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
