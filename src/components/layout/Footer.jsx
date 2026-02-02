import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight, Heart, Sparkles } from 'lucide-react';

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
    <footer className="bg-gradient-to-b from-secondary-900 via-secondary-950 to-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-custom py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary-400" />
                <span className="text-primary-400 font-semibold">Stay Updated</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-secondary-400">
                Get exclusive offers, new arrivals, and style tips delivered to your inbox.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 w-full sm:w-80"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
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
              <span className="text-3xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                Zzuhana
              </span>
            </Link>
            <p className="mt-5 text-secondary-400 leading-relaxed">
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
                  className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-primary-500 hover:border-primary-500 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-secondary-400 hover:text-white transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
              Customer Service
            </h4>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-secondary-400 hover:text-white transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-start gap-4 group">
                  <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-primary-500/20 transition-colors duration-300">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-secondary-400 group-hover:text-white transition-colors pt-1">
                    123 Fashion Street, Gulshan, Dhaka 1212, Bangladesh
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+8801234567890" className="flex items-center gap-4 group">
                  <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-primary-500/20 transition-colors duration-300">
                    <Phone className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-secondary-400 group-hover:text-white transition-colors">
                    +880 1234-567890
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@zzuhana.com" className="flex items-center gap-4 group">
                  <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-primary-500/20 transition-colors duration-300">
                    <Mail className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-secondary-400 group-hover:text-white transition-colors">
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
          className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-secondary-500 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} Zzuhana. Made with
            <Heart className="w-4 h-4 text-primary-500 fill-primary-500 inline" />
            in Bangladesh
          </p>
          <div className="flex items-center gap-4">
            <span className="text-secondary-500 text-sm">We Accept:</span>
            <div className="flex items-center gap-3">
              {['bkash', 'nagad', 'visa', 'mastercard'].map((payment) => (
                <div key={payment} className="px-3 py-1.5 bg-white/5 rounded-lg">
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
