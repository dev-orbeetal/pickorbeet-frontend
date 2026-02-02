import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'New Season Collection',
    subtitle: 'Spring/Summer 2024',
    description: 'Discover the latest trends in fashion with our exclusive collection of premium clothing.',
    cta: 'Shop Now',
    link: '/products',
    bgColor: 'from-rose-950 via-rose-900 to-rose-800',
    accentColor: 'from-rose-400 to-pink-500',
  },
  {
    id: 2,
    title: 'Elegant Styles',
    subtitle: 'Premium Quality',
    description: 'Experience luxury fashion with our handpicked selection of elegant clothing pieces.',
    cta: 'Explore Collection',
    link: '/products',
    bgColor: 'from-slate-950 via-slate-900 to-slate-800',
    accentColor: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    title: 'Special Offers',
    subtitle: 'Up to 50% Off',
    description: 'Don\'t miss out on our exclusive deals and discounts on selected items.',
    cta: 'View Offers',
    link: '/products?featured=true',
    bgColor: 'from-emerald-950 via-emerald-900 to-emerald-800',
    accentColor: 'from-emerald-400 to-teal-500',
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

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate]);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX / width);
    mouseY.set(clientY / height);
  };

  return (
    <section
      className="relative h-screen min-h-[700px] max-h-[900px] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
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
          {/* Animated Background */}
          <motion.div
            style={{ x: backgroundX, y: backgroundY }}
            className={`absolute inset-[-50px] bg-gradient-to-br ${slides[currentSlide].bgColor}`}
          >
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-radial from-white/20 to-transparent blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 rounded-full bg-gradient-radial from-primary-500/20 to-transparent blur-3xl"
              />
            </div>

            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>

          {/* Content */}
          <div className="container-custom h-full flex items-center relative z-10">
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl text-white"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                <span className={`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${slides[currentSlide].accentColor} rounded-full text-sm font-semibold shadow-lg`}>
                  <Sparkles className="w-4 h-4" />
                  {slides[currentSlide].subtitle}
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold mb-6 leading-[0.95] tracking-tight"
              >
                {slides[currentSlide].title.split(' ').map((word, i) => (
                  <span key={i} className="inline-block mr-4">
                    {word}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-200/90 mb-10 leading-relaxed max-w-lg"
              >
                {slides[currentSlide].description}
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Link
                  href={slides[currentSlide].link}
                  className="group relative inline-flex items-center px-8 py-4 bg-white text-secondary-900 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center">
                    {slides[currentSlide].cta}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:-translate-y-1"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </motion.button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
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
                ? 'w-12 bg-white'
                : 'w-6 bg-white/40 group-hover:bg-white/60'
              }`}>
              {index === currentSlide && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
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
        className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/60 z-20"
      >
        <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
