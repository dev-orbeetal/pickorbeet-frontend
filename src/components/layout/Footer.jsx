import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight, Heart, Crown } from 'lucide-react';

const footerLinks = {
  quickLinks: [
    { href: '/products', label: 'Shop All' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/track-order', label: 'Track Order' },
  ],
  customerService: [
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-cream-100 relative overflow-hidden border-t border-charcoal-800">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <Link href="/" className="inline-block group">
              <img src="/images/logo.png" alt="Zzuhana" className="h-10 w-auto" />
            </Link>
            <p className="mt-5 text-cream-400 leading-relaxed">
              Your destination for premium quality clothing. We bring you the latest fashion trends
              with exceptional quality and unmatched style.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-charcoal-800 rounded-xl border border-charcoal-700 hover:bg-gold-500 hover:border-gold-500 transition-all duration-300 group shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-cream-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-cream-100">
              <span className="w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-cream-400 hover:text-gold-400 transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gold-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-cream-100">
              <span className="w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
              Customer Service
            </h4>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-cream-400 hover:text-gold-400 transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gold-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-cream-100">
              <span className="w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-start gap-4 group">
                  <div className="p-2.5 bg-charcoal-800 rounded-lg group-hover:bg-gold-500/20 transition-colors duration-300 border border-charcoal-700 shadow-sm">
                    <MapPin className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-cream-400 group-hover:text-cream-200 transition-colors pt-1">
                    123 Fashion Street, Gulshan, Dhaka 1212, Bangladesh
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+8801234567890" className="flex items-center gap-4 group">
                  <div className="p-2.5 bg-charcoal-800 rounded-lg group-hover:bg-gold-500/20 transition-colors duration-300 border border-charcoal-700 shadow-sm">
                    <Phone className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-cream-400 group-hover:text-cream-200 transition-colors">
                    +880 1234-567890
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@zzuhana.com" className="flex items-center gap-4 group">
                  <div className="p-2.5 bg-charcoal-800 rounded-lg group-hover:bg-gold-500/20 transition-colors duration-300 border border-charcoal-700 shadow-sm">
                    <Mail className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-cream-400 group-hover:text-cream-200 transition-colors">
                    contact@zzuhana.com
                  </span>
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-charcoal-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-cream-400 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} Zuhana. Made with
            <Heart className="w-4 h-4 text-gold-500 fill-gold-500 inline" />
            in Bangladesh
          </p>
          <p className="text-cream-400 text-sm">
            Developed by{' '}
            <a
              href="https://orbeetal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              Orbeetal
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-cream-400 text-sm">We Accept:</span>
            <div className="flex items-center gap-3">
              {['bkash', 'nagad', 'visa', 'mastercard'].map((payment) => (
                <div key={payment} className="px-3 py-1.5 bg-charcoal-800 rounded-lg border border-charcoal-700 shadow-sm">
                  <img
                    src={`/images/payment/${payment}.svg`}
                    alt={payment}
                    className="h-5 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
