import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

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
  hidden: { opacity: 0, y: 40 },
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

export default function CategoryShowcase({ categoryProducts }) {
  const categoryProductsArray = Array.isArray(categoryProducts) ? categoryProducts : [];

  if (categoryProductsArray.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-cream-100">
      <div className="container-custom">
        {categoryProductsArray.map((categoryData, index) => {
          const category = categoryData.category;
          const products = categoryData.products || [];
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={category.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className={`relative mb-20 last:mb-0 ${index > 0 ? 'pt-20 border-t border-charcoal-200/30' : ''}`}
            >
              {/* Category Header */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
              >
                <div>
                  {category.tagline && (
                    <span className="inline-block px-4 py-1.5 bg-charcoal-900 text-gold-400 rounded-full text-sm font-medium mb-4">
                      {category.tagline}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-charcoal-900 mb-3">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-charcoal-600 text-lg max-w-xl">
                      {category.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/category/${category.slug}`}
                  className="group inline-flex items-center gap-2 mt-6 md:mt-0 text-charcoal-900 font-semibold hover:text-gold-600 transition-colors"
                >
                  {category.name}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              {/* Products Grid - Illiyeen Style */}
              <div className="product-grid">
                {products.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* View Collection Button */}
              <motion.div
                variants={itemVariants}
                className="text-center mt-10"
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-charcoal-900 text-charcoal-900 rounded-xl font-semibold hover:bg-charcoal-900 hover:text-cream-100 transition-all duration-300"
                >
                  View {category.name} Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
