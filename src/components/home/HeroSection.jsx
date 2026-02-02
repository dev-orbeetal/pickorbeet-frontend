import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'New Season Collection',
    subtitle: 'Spring/Summer 2024',
    description: 'Discover the latest trends in fashion with our exclusive collection of premium clothing.',
    cta: 'Shop Now',
    link: '/products',
    bgColor: 'from-rose-900 via-rose-800 to-rose-700',
  },
  {
    id: 2,
    title: 'Elegant Styles',
    subtitle: 'Premium Quality',
    description: 'Experience luxury fashion with our handpicked selection of elegant clothing pieces.',
    cta: 'Explore Collection',
    link: '/products',
    bgColor: 'from-slate-900 via-slate-800 to-slate-700',
  },
  {
    id: 3,
    title: 'Special Offers',
    subtitle: 'Up to 50% Off',
    description: 'Don\'t miss out on our exclusive deals and discounts on selected items.',
    cta: 'View Offers',
    link: '/products?featured=true',
    bgColor: 'from-emerald-900 via-emerald-800 to-emerald-700',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-secondary-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgColor}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="container-custom h-full flex items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xl text-white"
            >
              <span className="inline-block px-4 py-1 bg-primary-600/90 rounded-full text-sm font-medium mb-4">
                {slides[currentSlide].subtitle}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                {slides[currentSlide].description}
              </p>
              <Link
                href={slides[currentSlide].link}
                className="inline-flex items-center btn btn-primary text-lg group"
              >
                {slides[currentSlide].cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? 'bg-primary-500 w-8'
              : 'bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </section>
  );
}
