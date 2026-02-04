import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, TrendingUp } from 'lucide-react';
import ProductCard from '../products/ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function FeaturedProducts({ products }) {
  const productsArray = Array.isArray(products) ? products : [];

  if (productsArray.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-cream-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14"
        >
          <div>
            <motion.div variants={titleVariants} className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-950 rounded-full text-sm font-bold">
                <Crown className="w-4 h-4" />
                Bestsellers
              </span>
            </motion.div>
            <motion.h2 variants={titleVariants} className="section-title mb-4">
              Featured Products
            </motion.h2>
            <motion.p variants={titleVariants} className="section-subtitle">
              Handpicked selections of our most popular and trending items
            </motion.p>
          </div>
          <motion.div variants={titleVariants}>
            <Link
              href="/products?featured=true"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-charcoal-900 border border-charcoal-800 rounded-xl text-cream-300 font-semibold hover:bg-charcoal-800 hover:border-gold-500/30 hover:text-gold-400 transition-all duration-300 mt-6 md:mt-0"
            >
              View All Products
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {productsArray.slice(0, 8).map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Trending indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gold-500/20"
        >
          <div className="flex items-center gap-2 text-charcoal-600">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <span className="text-sm font-medium">Trending this week</span>
          </div>
          <div className="h-4 w-px bg-gold-500/30" />
          <div className="text-sm text-charcoal-500">
            Updated daily based on customer favorites
          </div>
        </motion.div>
      </div>
    </section>
  );
}
