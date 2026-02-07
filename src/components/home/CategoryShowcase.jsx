import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 4).map((product, productIndex) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative bg-gradient-to-b from-cream-200 to-cream-300 rounded-2xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-xl transition-shadow duration-500">
                        {/* Product Image */}
                        {product.primary_image ? (
                          <img
                            src={getMediaUrl(product.primary_image)}
                            alt={product.name}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-32 h-40 bg-charcoal-300/30 rounded-lg" />
                          </div>
                        )}

                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Discount Badge */}
                        {product.discount_percentage > 0 && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                            -{product.discount_percentage}%
                          </div>
                        )}

                        {/* Product Info - Appears on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-cream-100 font-semibold text-lg mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-gold-400 font-bold">৳{product.price}</span>
                            {product.compare_price && (
                              <span className="text-cream-400/60 line-through text-sm">
                                ৳{product.compare_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Name Below Image */}
                      <div className="mt-4 text-center">
                        <h3 className="text-charcoal-900 font-medium mb-1 group-hover:text-gold-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-charcoal-900 font-semibold">৳{product.price}</span>
                          {product.compare_price && (
                            <span className="text-charcoal-400 line-through text-sm">
                              ৳{product.compare_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
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
