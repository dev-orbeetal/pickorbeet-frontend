import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function SlideFrame({ banner, children }) {
  const className = 'absolute inset-0 block';
  if (!banner?.link) return <div className={className}>{children}</div>;
  if (banner.link.startsWith('http')) {
    return <a href={banner.link} className={className}>{children}</a>;
  }
  return <Link href={banner.link} className={className}>{children}</Link>;
}

const slideEase = [0.16, 1, 0.3, 1];

export default function HeroSlider({ banners = [] }) {
  const slides = Array.isArray(banners) ? banners : [];
  const [[index, direction], setSlide] = useState([0, 0]);

  useEffect(() => {
    setSlide([0, 0]);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setSlide(([current]) => [(current + 1) % slides.length, 1]);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (step) => {
    if (slides.length === 0) return;
    setSlide(([current]) => [(current + step + slides.length) % slides.length, step]);
  };

  const slide = slides[index];

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: slideEase }}
          className="relative w-full aspect-[10/3] rounded-2xl overflow-hidden bg-navy-900"
        >
          <AnimatePresence initial={false} custom={direction}>
            {slide && (
              <motion.div
                key={slide.id || index}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 48 : -48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -48 : 48 }}
                transition={{ duration: 0.45, ease: slideEase }}
                className="absolute inset-0"
              >
                <SlideFrame banner={slide}>
                  <img
                    src={getMediaUrl(slide.image)}
                    alt=""
                    className="w-full h-full object-cover object-center"
                  />
                </SlideFrame>
              </motion.div>
            )}
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <motion.button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-navy-900 shadow flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-navy-900 shadow flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
