import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';
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
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
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

export default function CategorySection({ categories }) {
  const categoriesArray = Array.isArray(categories) ? categories : [];
  // Sort by display_order, featured categories first
  const sortedCategories = [...categoriesArray].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (a.display_order || 0) - (b.display_order || 0);
  });

  if (sortedCategories.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-cream-100 relative overflow-hidden">
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal-300/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-gold-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-radial from-gold-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={titleVariants} className="flex items-center justify-center gap-2 mb-5">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-charcoal-900 text-gold-400 rounded-full text-sm font-semibold shadow-lg">
              <Crown className="w-4 h-4" />
              Premium Collections
            </span>
          </motion.div>
          <motion.h2 variants={titleVariants} className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-charcoal-900 mb-5">
            Shop by Category
          </motion.h2>
          <motion.p variants={titleVariants} className="text-charcoal-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of luxury fashion categories, designed for the discerning individual
          </motion.p>
        </motion.div>

        {/* Premium Category Grid - Illiyeen Style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8"
        >
          {sortedCategories.slice(0, 8).map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/category/${category.slug}`} className="block">
                {/* Card Container */}
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-charcoal-100">
                  {/* Image Container with Elegant Background */}
                  <div className="relative aspect-[4/5] bg-gradient-to-b from-cream-200 via-cream-100 to-cream-200 overflow-hidden">
                    {category.image ? (
                      <img
                        src={getMediaUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-32 bg-charcoal-200/50 rounded-lg shadow-inner" />
                      </div>
                    )}

                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Hover Content */}
                    <div className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-bold">
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {category.is_featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-block px-2 py-1 bg-gold-500 text-white text-xs font-bold rounded">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Tagline Badge */}
                    {category.tagline && (
                      <div className="absolute top-4 left-4 right-16">
                        <span className="inline-block px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm text-cream-100 text-xs font-medium rounded-full">
                          {category.tagline}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Name - Below Image */}
                  <div className="p-4 text-center border-t border-charcoal-100 bg-white">
                    <h3 className="font-semibold text-charcoal-900 group-hover:text-gold-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 mt-1 text-charcoal-500 text-sm">
                      <span>Shop Now</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Categories Link */}
        {categoriesArray.length > 8 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal-900 text-cream-100 rounded-xl font-semibold hover:bg-charcoal-800 hover:shadow-xl transition-all duration-300"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
