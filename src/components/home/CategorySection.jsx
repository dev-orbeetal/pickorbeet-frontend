import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';

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

  if (categoriesArray.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-cream-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={titleVariants} className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-charcoal-900 text-gold-400 rounded-full text-sm font-semibold">
              <Crown className="w-4 h-4" />
              Collections
            </span>
          </motion.div>
          <motion.h2 variants={titleVariants} className="section-title mb-5">
            Shop by Category
          </motion.h2>
          <motion.p variants={titleVariants} className="section-subtitle mx-auto">
            Explore our curated collection of luxury fashion categories
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categoriesArray.slice(0, 8).map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/category/${category.slug}`} className="block group">
                <div className="relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-charcoal-900 shadow-dark group-hover:shadow-dark-lg transition-shadow duration-500 border border-gold-500/10 group-hover:border-gold-500/30">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950" />
                  )}

                  {/* Multi-layer gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                      <h3 className="text-cream-100 text-lg md:text-xl font-bold mb-2 drop-shadow-lg">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-gold-400 text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        <span className="mr-2">Shop Now</span>
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* Corner gold shine effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
