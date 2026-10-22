import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';
import ProductCard from '../products/ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

export default function CategoryProducts({ categoryProducts }) {
  const categoryProductsArray = Array.isArray(categoryProducts) ? categoryProducts : [];

  if (categoryProductsArray.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-charcoal-900 relative">
      <div className="container-custom">
        {categoryProductsArray.map((categoryData, categoryIndex) => (
          <motion.div
            key={categoryData.category.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`${categoryIndex > 0 ? 'mt-24 pt-24 border-t border-gold-500/10' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-gold-500/20">
                    <Crown className="w-3 h-3" />
                    Collection
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-cream-100 mb-3">
                  {categoryData.category.name}
                </h2>
                <p className="text-cream-500 text-lg">
                  Explore our curated {categoryData.category.name.toLowerCase()} collection
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link
                  href={`/category/${categoryData.category.slug}`}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-300 mt-6 md:mt-0"
                >
                  View Collection
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="product-grid"
            >
              {categoryData.products.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
