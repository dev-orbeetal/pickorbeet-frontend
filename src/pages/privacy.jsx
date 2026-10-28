import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Shield, Scale, Lock, Eye } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const sections = [
  { id: 'info-collect', number: '1', title: 'Information We Collect' },
  { id: 'how-we-use', number: '2', title: 'How We Use Your Information' },
  { id: 'sharing', number: '3', title: 'Sharing of Information' },
  { id: 'data-security', number: '4', title: 'Data Security' },
  { id: 'cookies', number: '5', title: 'Cookies' },
  { id: 'third-party', number: '6', title: 'Third-Party Links' },
  { id: 'your-rights', number: '7', title: 'Your Rights' },
  { id: 'updates', number: '8', title: 'Updates to This Policy' },
  { id: 'contact', number: '9', title: 'Contact Us' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('info-collect');

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
      title="Privacy Policy - Pickorbeet"
      description="Learn how Pickorbeet collects, uses, and protects your personal information. Read our full Privacy Policy."
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
            <span className="text-cream-200">Privacy Policy</span>
          </motion.nav>
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 border border-gold-500/20 rounded-full text-gold-400 text-sm font-medium mb-6">
              <Lock className="w-4 h-4" />
              Your Privacy Matters
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-display font-bold mb-5">
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-cream-300 leading-relaxed max-w-2xl">
              At Pickorbeet, we respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm text-cream-500 mt-4">
              Last Updated: March 9, 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
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
                  At Pickorbeet, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website <a href="https://www.pickorbeet.com" className="text-primary-600 hover:underline">https://www.pickorbeet.com</a>.
                </p>

                {/* Section 1 */}
                <PolicySection id="info-collect" number="1" title="Information We Collect">
                  <p>When you use our website, we may collect the following information:</p>

                  <h4 className="font-semibold text-charcoal-800 mt-5 mb-2">Personal Information</h4>
                  <ul>
                    <li>Name</li>
                    <li>Phone Number</li>
                    <li>Delivery Address</li>
                    <li>Email Address</li>
                  </ul>

                  <h4 className="font-semibold text-charcoal-800 mt-5 mb-2">Order Information</h4>
                  <ul>
                    <li>Products ordered</li>
                    <li>Payment method</li>
                    <li>Delivery information</li>
                  </ul>

                  <h4 className="font-semibold text-charcoal-800 mt-5 mb-2">Technical Information</h4>
                  <ul>
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Device information</li>
                    <li>Website usage data</li>
                  </ul>
                </PolicySection>

                {/* Section 2 */}
                <PolicySection id="how-we-use" number="2" title="How We Use Your Information">
                  <p>We use your information to:</p>
                  <ul>
                    <li>Process and deliver orders</li>
                    <li>Communicate with customers</li>
                    <li>Improve our website and services</li>
                    <li>Provide customer support</li>
                    <li>Prevent fraud and enhance security</li>
                  </ul>
                </PolicySection>

                {/* Section 3 */}
                <PolicySection id="sharing" number="3" title="Sharing of Information">
                  <p>Pickorbeet does not sell or rent personal information to third parties.</p>
                  <p>However, information may be shared with:</p>
                  <ul>
                    <li>Delivery partners</li>
                    <li>Payment processing services</li>
                    <li>Legal authorities if required by law</li>
                  </ul>
                </PolicySection>

                {/* Section 4 */}
                <PolicySection id="data-security" number="4" title="Data Security">
                  <p>We implement reasonable security measures to protect your personal information from unauthorized access or misuse.</p>
                  <p>However, no internet transmission is completely secure.</p>
                </PolicySection>

                {/* Section 5 */}
                <PolicySection id="cookies" number="5" title="Cookies">
                  <p>Our website may use cookies to improve user experience.</p>
                  <p>Cookies help us:</p>
                  <ul>
                    <li>Remember user preferences</li>
                    <li>Improve website functionality</li>
                    <li>Analyze website traffic</li>
                  </ul>
                  <p>When you are signed in, pages you open can be linked to your account so store staff can see which customers visited which pages.</p>
                  <p>We do not store your IP address.</p>
                  <p>Users can disable cookies through browser settings.</p>
                </PolicySection>

                {/* Section 6 */}
                <PolicySection id="third-party" number="6" title="Third-Party Links">
                  <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices.</p>
                </PolicySection>

                {/* Section 7 */}
                <PolicySection id="your-rights" number="7" title="Your Rights">
                  <p>You have the right to:</p>
                  <ul>
                    <li>Request access to your personal data</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of personal data when applicable. The steps are on the <Link href="/delete-account" className="text-primary-600 hover:underline">delete account</Link> page.</li>
                  </ul>
                  <p>To make such requests, please contact us.</p>
                </PolicySection>

                {/* Section 8 */}
                <PolicySection id="updates" number="8" title="Updates to This Policy">
                  <p>Pickorbeet may update this Privacy Policy occasionally. Updates will be posted on this page with a revised date.</p>
                </PolicySection>

                {/* Section 9 */}
                <PolicySection id="contact" number="9" title="Contact Us" isLast>
                  <p>For questions regarding this Privacy Policy, please contact us:</p>
                  <div className="mt-4 p-5 bg-cream-50 rounded-xl border border-cream-200">
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
      <div className="prose prose-charcoal max-w-none text-charcoal-600 leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-1.5 [&>ul>li]:text-charcoal-600 [&>h4]:text-charcoal-800">
        {children}
      </div>
    </motion.div>
  );
}
