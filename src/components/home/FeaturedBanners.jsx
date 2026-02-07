import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function FeaturedBanners({ categories }) {
  const featuredCategories = Array.isArray(categories)
    ? categories.filter(cat => cat.is_featured).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = useCallback((newDirection) => {
    if (featuredCategories.length === 0) return;
    const newIndex = (currentIndex + newDirection + featuredCategories.length) % featuredCategories.length;
    setPage([page + newDirection, newDirection]);
    setCurrentIndex(newIndex);
  }, [currentIndex, page, featuredCategories.length]);

  const goToSlide = (index) => {
    const direction = index > currentIndex ? 1 : -1;
    setPage([page + direction, direction]);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying || featuredCategories.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate, featuredCategories.length]);

  if (featuredCategories.length === 0) return null;

  const currentCategory = featuredCategories[currentIndex];

  return (
    <section
      className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-charcoal-950"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {currentCategory.banner_image || currentCategory.image ? (
              <img
                src={getMediaUrl(currentCategory.banner_image || currentCategory.image)}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950" />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-charcoal-950/30" />
          </div>

          {/* Content */}
          <div className="container-custom h-full flex items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-2xl"
            >
              {currentCategory.tagline && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-4"
                >
                  <span className="inline-block px-4 py-2 bg-gold-500/20 border border-gold-500/30 text-gold-400 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentCategory.tagline}
                  </span>
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-cream-100 mb-6 leading-tight"
              >
                {currentCategory.name}
              </motion.h2>

              {currentCategory.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg md:text-xl text-cream-400 mb-8 line-clamp-2"
                >
                  {currentCategory.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link
                  href={`/category/${currentCategory.slug}`}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 hover:shadow-2xl hover:shadow-gold-500/30 transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {featuredCategories.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-charcoal-900/50 backdrop-blur-md rounded-full text-gold-400 border border-gold-500/20 hover:bg-gold-500/10 hover:border-gold-500/40 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-charcoal-900/50 backdrop-blur-md rounded-full text-gold-400 border border-gold-500/20 hover:bg-gold-500/10 hover:border-gold-500/40 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredCategories.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {featuredCategories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex
                ? 'w-12 bg-gold-500'
                : 'w-6 bg-cream-100/30 hover:bg-cream-100/50'
                }`}
            />
          ))}
        </div>
      )}

      {/* Category Quick Links */}
      {featuredCategories.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          {featuredCategories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => goToSlide(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${index === currentIndex
                ? 'bg-gold-500 text-white'
                : 'bg-charcoal-900/50 backdrop-blur-sm text-cream-300 hover:bg-charcoal-800/70 border border-cream-100/10'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
