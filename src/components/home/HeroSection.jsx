import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Luxury Collection',
    subtitle: 'New Arrivals 2024',
    description: 'Discover timeless elegance with our exclusive collection of premium fashion pieces.',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    id: 2,
    title: 'Elegant Styles',
    subtitle: 'Premium Quality',
    description: 'Experience the finest craftsmanship with our handpicked selection of luxury clothing.',
    cta: 'Explore Collection',
    link: '/products',
  },
  {
    id: 3,
    title: 'Exclusive Offers',
    subtitle: 'Limited Time',
    description: 'Indulge in luxury with exclusive deals on our finest fashion selections.',
    cta: 'View Offers',
    link: '/products?featured=true',
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95,
  }),
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const backgroundX = useTransform(mouseX, [0, 1], [-15, 15]);
  const backgroundY = useTransform(mouseY, [0, 1], [-15, 15]);

  const paginate = useCallback((newDirection) => {
    const newIndex = (currentSlide + newDirection + slides.length) % slides.length;
    setPage([page + newDirection, newDirection]);
    setCurrentSlide(newIndex);
  }, [currentSlide, page]);

  const goToSlide = (index) => {
    const direction = index > currentSlide ? 1 : -1;
    setPage([page + direction, direction]);
    setCurrentSlide(index);
  };

  // Auto-slide every 5 seconds - always active
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [paginate]);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX / width);
    mouseY.set(clientY / height);
  };

  return (
    <section
      className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden -mt-16 md:-mt-20"
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          className="absolute inset-0"
        >
          {/* Animated Background - Luxury Dark Theme */}
          <motion.div
            style={{ x: backgroundX, y: backgroundY }}
            className="absolute inset-[-50px] bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950"
          >
            {/* Gold gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-radial from-gold-500/30 to-transparent blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 rounded-full bg-gradient-radial from-gold-600/20 to-transparent blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full bg-gradient-radial from-gold-400/20 to-transparent blur-3xl"
              />
            </div>

            {/* Luxury texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/80 via-charcoal-950/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />
          </motion.div>

          {/* Content */}
          <div className="container-custom h-full flex items-center relative z-10">
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-full text-sm font-bold shadow-lg shadow-gold-500/20">
                  <Crown className="w-4 h-4" />
                  {slides[currentSlide].subtitle}
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold mb-6 leading-[0.95] tracking-tight"
              >
                {slides[currentSlide].title.split(' ').map((word, i) => (
                  <span key={i} className={`inline-block mr-4 ${i === 0 ? 'text-gold-500' : 'text-cream-100'}`}>
                    {word}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-cream-400/90 mb-10 leading-relaxed max-w-lg"
              >
                {slides[currentSlide].description}
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Link
                  href={slides[currentSlide].link}
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/30 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center">
                    {slides[currentSlide].cta}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-gold-500/40 text-gold-400 rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-gold-500/10 hover:border-gold-500/60 transition-all duration-300 hover:-translate-y-1"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Lower opacity, visible on hover */}
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className="p-3 md:p-4 bg-charcoal-900/30 backdrop-blur-md rounded-full text-gold-400/50 border border-gold-500/10 hover:bg-gold-500/10 hover:border-gold-500/40 hover:text-gold-400 transition-all duration-300 group opacity-40 hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </motion.button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className="p-3 md:p-4 bg-charcoal-900/30 backdrop-blur-md rounded-full text-gold-400/50 border border-gold-500/10 hover:bg-gold-500/10 hover:border-gold-500/40 hover:text-gold-400 transition-all duration-300 group opacity-40 hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-0.5" />
        </motion.button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className="group relative py-2"
          >
            <div className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide
              ? 'w-12 bg-gold-500'
              : 'w-6 bg-gold-500/30 group-hover:bg-gold-500/50'
              }`}>
              {index === currentSlide && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-400 to-gold-300 rounded-full"
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-gold-500/60 z-20"
      >
        <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-gold-500/30 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-gold-500/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
