import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Shield, Scale } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const sections = [
  { id: 'general', number: '1', title: 'General Information' },
  { id: 'eligibility', number: '2', title: 'Eligibility' },
  { id: 'products-pricing', number: '3', title: 'Products and Pricing' },
  { id: 'orders', number: '4', title: 'Orders' },
  { id: 'delivery', number: '5', title: 'Delivery Policy' },
  { id: 'payment', number: '6', title: 'Payment Methods' },
  { id: 'returns', number: '7', title: 'Return and Exchange Policy' },
  { id: 'intellectual-property', number: '8', title: 'Intellectual Property' },
  { id: 'user-conduct', number: '9', title: 'User Conduct' },
  { id: 'liability', number: '10', title: 'Limitation of Liability' },
  { id: 'changes', number: '11', title: 'Changes to Terms' },
  { id: 'contact', number: '12', title: 'Contact Information' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('general');

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
      title="Terms and Conditions - Zzuhana"
      description="Read the Terms and Conditions for using the Zzuhana website. Learn about our policies on orders, delivery, payment, returns, and more."
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
            <span className="text-cream-200">Terms and Conditions</span>
          </motion.nav>
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 border border-gold-500/20 rounded-full text-gold-400 text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              Legal Agreement
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-display font-bold mb-5">
              Terms and Conditions
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-cream-300 leading-relaxed max-w-2xl">
              Please read these terms carefully before using our website. By accessing or using zzuhana.com, you agree to be bound by these terms.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm text-cream-500 mt-4">
              Last Updated: March 9, 2026
            </motion.p>
          </motion.div>
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
                <p className="text-charcoal-600 leading-relaxed mb-10">
                  Welcome to Z ZUHANA. By accessing or using our website (<a href="https://www.zzuhana.com" className="text-primary-600 hover:underline">https://www.zzuhana.com</a>), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
                </p>

                {/* Section 1 */}
                <PolicySection id="general" number="1" title="General Information">
                  <p>This website is operated by Z ZUHANA. Throughout the site, the terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Z ZUHANA. By visiting our website and purchasing products from us, you engage in our service and agree to be bound by these Terms and Conditions.</p>
                  <p>If you do not agree with any part of these terms, you should not use this website.</p>
                </PolicySection>

                {/* Section 2 */}
                <PolicySection id="eligibility" number="2" title="Eligibility">
                  <p>By using this website, you confirm that:</p>
                  <ul>
                    <li>You are at least 18 years old or using the site under the supervision of a parent or legal guardian.</li>
                    <li>You will provide accurate and complete information when placing an order.</li>
                  </ul>
                </PolicySection>

                {/* Section 3 */}
                <PolicySection id="products-pricing" number="3" title="Products and Pricing">
                  <p>Z ZUHANA sells clothing and fashion products through this website.</p>
                  <ul>
                    <li>All prices are listed in Bangladeshi Taka (BDT).</li>
                    <li>Prices and product availability may change without prior notice.</li>
                    <li>We reserve the right to modify or discontinue any product at any time.</li>
                  </ul>
                  <p>We try to display product colors and images as accurately as possible, but actual colors may vary slightly depending on your device screen.</p>
                </PolicySection>

                {/* Section 4 */}
                <PolicySection id="orders" number="4" title="Orders">
                  <p>When placing an order on our website:</p>
                  <ul>
                    <li>You agree that all information provided is accurate.</li>
                    <li>Z ZUHANA reserves the right to cancel or refuse any order if necessary.</li>
                    <li>If a prepaid order is cancelled, the payment will be refunded according to our refund policy.</li>
                  </ul>
                </PolicySection>

                {/* Section 5 */}
                <PolicySection id="delivery" number="5" title="Delivery Policy">
                  <p>We provide home delivery services within Bangladesh.</p>
                  <p>Delivery conditions include:</p>
                  <ul>
                    <li>Delivery time may vary depending on your location.</li>
                    <li>Delivery charges may apply depending on delivery area.</li>
                    <li>Customers must provide accurate address and phone number.</li>
                  </ul>
                  <p>If delivery fails due to incorrect information provided by the customer, additional delivery charges may apply.</p>
                </PolicySection>

                {/* Section 6 */}
                <PolicySection id="payment" number="6" title="Payment Methods">
                  <p>We may accept the following payment methods:</p>
                  <ul>
                    <li>Cash on Delivery (COD)</li>
                    <li>Mobile Banking (bKash, Nagad, Rocket)</li>
                    <li>Online Payment Gateway (if available)</li>
                  </ul>
                  <p>Orders will be processed once payment confirmation is received (except COD orders).</p>
                </PolicySection>

                {/* Section 7 */}
                <PolicySection id="returns" number="7" title="Return and Exchange Policy">
                  <p>Customer satisfaction is important to us. If you receive a defective or incorrect product:</p>
                  <ul>
                    <li>Contact us within 3 days after receiving the item.</li>
                    <li>Products must be unused and in original condition.</li>
                    <li>Exchanges depend on product availability.</li>
                  </ul>
                  <p>Delivery charges for returns or exchanges may apply.</p>
                </PolicySection>

                {/* Section 8 */}
                <PolicySection id="intellectual-property" number="8" title="Intellectual Property">
                  <p>All content on this website including:</p>
                  <ul>
                    <li>Logo</li>
                    <li>Product images</li>
                    <li>Text</li>
                    <li>Website design</li>
                  </ul>
                  <p>are the property of Z ZUHANA and protected by copyright laws. Unauthorized use is prohibited.</p>
                </PolicySection>

                {/* Section 9 */}
                <PolicySection id="user-conduct" number="9" title="User Conduct">
                  <p>You agree not to:</p>
                  <ul>
                    <li>Use the website for illegal activities</li>
                    <li>Attempt to hack or damage the website</li>
                    <li>Provide false information</li>
                  </ul>
                  <p>Violation may result in suspension of access.</p>
                </PolicySection>

                {/* Section 10 */}
                <PolicySection id="liability" number="10" title="Limitation of Liability">
                  <p>Z ZUHANA shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our website or products.</p>
                </PolicySection>

                {/* Section 11 */}
                <PolicySection id="changes" number="11" title="Changes to Terms">
                  <p>Z ZUHANA reserves the right to update or modify these Terms and Conditions at any time. Changes will be effective once posted on this page.</p>
                </PolicySection>

                {/* Section 12 */}
                <PolicySection id="contact" number="12" title="Contact Information" isLast>
                  <p>If you have any questions regarding these Terms and Conditions, please contact us:</p>
                  <div className="mt-4 p-5 bg-cream-50 rounded-xl border border-cream-200">
                    <p className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-charcoal-800">Website:</span>
                      <a href="https://www.zzuhana.com" className="text-primary-600 hover:underline">https://www.zzuhana.com</a>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-800">Email:</span>
                      <a href="mailto:support@zzuhana.com" className="text-primary-600 hover:underline">support@zzuhana.com</a>
                    </p>
                  </div>
                </PolicySection>
              </div>

              {/* Related Policy Links */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Link href="/privacy" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-cream-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 group-hover:text-primary-700 transition-colors">Privacy Policy</p>
                    <p className="text-sm text-charcoal-500">How we handle your data</p>
                  </div>
                </Link>
                <Link href="/returns" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-cream-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 group-hover:text-primary-700 transition-colors">Return & Refund Policy</p>
                    <p className="text-sm text-charcoal-500">Our return and refund process</p>
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
      <div className="prose prose-charcoal max-w-none text-charcoal-600 leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-1.5 [&>ul>li]:text-charcoal-600">
        {children}
      </div>
    </motion.div>
  );
}
