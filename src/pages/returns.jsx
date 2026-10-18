import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Scale, RotateCcw, Package, AlertCircle, Truck, CreditCard, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const sections = [
  { id: 'return-eligibility', number: '1', title: 'Return Eligibility' },
  { id: 'non-returnable', number: '2', title: 'Non-Returnable Items' },
  { id: 'exchange', number: '3', title: 'Exchange Policy' },
  { id: 'refund', number: '4', title: 'Refund Policy' },
  { id: 'return-shipping', number: '5', title: 'Return Shipping' },
  { id: 'cod-orders', number: '6', title: 'Cash on Delivery (COD) Orders' },
  { id: 'how-to-return', number: '7', title: 'How to Request a Return' },
  { id: 'policy-updates', number: '8', title: 'Policy Updates' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

const highlights = [
  { icon: Clock, label: '3-Day', desc: 'Return Window' },
  { icon: Package, label: 'Original', desc: 'Condition Required' },
  { icon: CreditCard, label: '5–7 Days', desc: 'Refund Processing' },
  { icon: Truck, label: 'Free Return', desc: 'On Defective Items' },
];

export default function ReturnsPage() {
  const [activeSection, setActiveSection] = useState('return-eligibility');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i];
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
    }
  };

  return (
    <Layout
      title="Return and Refund Policy - Pickorbeet"
      description="Read the Pickorbeet Return and Refund Policy. Learn about return eligibility, exchange process, refund timelines, and how to request a return."
    >
      {/* Hero */}
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
            <span className="text-cream-200">Return and Refund Policy</span>
          </motion.nav>
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 border border-gold-500/20 rounded-full text-gold-400 text-sm font-medium mb-6">
              <RotateCcw className="w-4 h-4" />
              Customer Satisfaction Guaranteed
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-display font-bold mb-5">
              Return and Refund Policy
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-cream-300 leading-relaxed max-w-2xl">
              At Pickorbeet, customer satisfaction is our priority. If you are not completely satisfied with your purchase, please review our return and refund policy below.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm text-cream-500 mt-4">
              Last Updated: March 9, 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-white border-b border-cream-200">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2.5 bg-primary-50 rounded-xl">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-charcoal-900 text-sm">{item.label}</p>
                  <p className="text-xs text-charcoal-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20 bg-cream-50">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Sidebar TOC */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal-400 mb-4">On this page</h3>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                        activeSection === s.id
                          ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                          : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100'
                      }`}
                    >
                      <span className="text-xs text-charcoal-400 w-5">{s.number}.</span>
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 md:p-12">

                {/* Section 1 */}
                <PolicySection id="return-eligibility" number="1" title="Return Eligibility">
                  <p>You may request a return or exchange if:</p>
                  <ul>
                    <li>The product is damaged or defective</li>
                    <li>You received the wrong product</li>
                    <li>The product has a manufacturing defect</li>
                  </ul>
                  <p>To be eligible for a return:</p>
                  <ul>
                    <li>The request must be made within <strong>3 days</strong> of receiving the product</li>
                    <li>The item must be unused, unwashed, and in original condition</li>
                    <li>All original tags and packaging must be intact</li>
                  </ul>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Products that do not meet these conditions may not be eligible for return or exchange.</p>
                  </div>
                </PolicySection>

                {/* Section 2 */}
                <PolicySection id="non-returnable" number="2" title="Non-Returnable Items">
                  <p>The following items are <strong>not eligible</strong> for return:</p>
                  <ul>
                    <li>Used or washed products</li>
                    <li>Products damaged by the customer</li>
                    <li>Items returned after the return period</li>
                    <li>Clearance or discounted items (if specified)</li>
                  </ul>
                </PolicySection>

                {/* Section 3 */}
                <PolicySection id="exchange" number="3" title="Exchange Policy">
                  <p>If you receive a defective or incorrect product, we will arrange an exchange for the correct item, subject to product availability.</p>
                  <p>If the requested item is not available, we may offer:</p>
                  <ul>
                    <li>A replacement product of similar value, or</li>
                    <li>A refund</li>
                  </ul>
                </PolicySection>

                {/* Section 4 */}
                <PolicySection id="refund" number="4" title="Refund Policy">
                  <p>Refunds may be issued in the following cases:</p>
                  <ul>
                    <li>The ordered product is out of stock</li>
                    <li>The product cannot be exchanged</li>
                    <li>The return request is approved by our support team</li>
                  </ul>
                  <p>Refunds will be processed through the original payment method where possible.</p>
                  <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-xl flex gap-3">
                    <Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-800">Refund processing time may take <strong>5–7 business days</strong> depending on the payment method.</p>
                  </div>
                </PolicySection>

                {/* Section 5 */}
                <PolicySection id="return-shipping" number="5" title="Return Shipping">
                  <p>Return shipping conditions may vary:</p>
                  <ul>
                    <li>If the return is due to <strong>our mistake</strong> (wrong or defective item), Pickorbeet will cover the return delivery cost.</li>
                    <li>If the return is due to <strong>customer preference</strong>, the customer may need to bear the return delivery cost.</li>
                  </ul>
                </PolicySection>

                {/* Section 6 */}
                <PolicySection id="cod-orders" number="6" title="Cash on Delivery (COD) Orders">
                  <p>For Cash on Delivery orders, refunds (if applicable) may be sent through:</p>
                  <ul>
                    <li>bKash</li>
                    <li>Nagad</li>
                    <li>Rocket</li>
                  </ul>
                  <p>Customers must provide the correct mobile banking number for the refund process.</p>
                </PolicySection>

                {/* Section 7 */}
                <PolicySection id="how-to-return" number="7" title="How to Request a Return">
                  <p>To request a return or exchange, please contact us with the following information:</p>
                  <ul>
                    <li>Order number</li>
                    <li>Product name</li>
                    <li>Reason for return</li>
                    <li>Photo of the product (if damaged or incorrect)</li>
                  </ul>
                  <div className="mt-4 p-5 bg-cream-50 rounded-xl border border-cream-200">
                    <p className="font-medium text-charcoal-800 mb-3">Contact us at:</p>
                    <p className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-charcoal-800">Website:</span>
                      <a href="https://www.pickorbeet.com" className="text-primary-600 hover:underline">https://www.pickorbeet.com</a>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-800">Email:</span>
                      <a href="mailto:support@pickorbeet.com" className="text-primary-600 hover:underline">support@pickorbeet.com</a>
                    </p>
                  </div>
                </PolicySection>

                {/* Section 8 */}
                <PolicySection id="policy-updates" number="8" title="Policy Updates" isLast>
                  <p>Pickorbeet reserves the right to modify this Return and Refund Policy at any time. Any changes will be updated on this page.</p>
                </PolicySection>
              </div>

              {/* Related Policy Links */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Link href="/terms" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-cream-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                    <Scale className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 group-hover:text-primary-700 transition-colors">Terms and Conditions</p>
                    <p className="text-sm text-charcoal-500">Our terms of service</p>
                  </div>
                </Link>
                <Link href="/privacy" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-cream-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 group-hover:text-primary-700 transition-colors">Privacy Policy</p>
                    <p className="text-sm text-charcoal-500">How we handle your data</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function PolicySection({ id, number, title, children, isLast = false }) {
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      className={!isLast ? 'mb-10 pb-10 border-b border-cream-200' : 'mb-0'}
    >
      <h2 className="text-xl md:text-2xl font-display font-bold text-charcoal-900 mb-4 flex items-baseline gap-3">
        <span className="text-primary-500 text-lg">{number}.</span>
        {title}
      </h2>
      <div className="prose prose-charcoal max-w-none text-charcoal-600 leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-1.5 [&>ul>li]:text-charcoal-600 [&_strong]:text-charcoal-800">
        {children}
      </div>
    </motion.div>
  );
}
