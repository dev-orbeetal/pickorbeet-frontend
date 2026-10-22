import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function ordered(items) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

const slideEase = [0.16, 1, 0.3, 1];

export default function HeroSlider({ banners = [], cards = [] }) {
  const slides = ordered(Array.isArray(banners) ? banners : []).filter((banner) => banner?.image);
  const sideCards = ordered(Array.isArray(cards) ? cards : []).filter((banner) => banner?.image).slice(0, 2);
  const split = sideCards.length > 0;
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
  if (slides.length === 0 && sideCards.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-4">
        <div className={`grid items-start gap-3 ${split ? 'min-[960px]:[grid-template-columns:minmax(0,calc((200%+0.75rem)/3))_minmax(0,calc((100%-3rem)/3))]' : ''}`}>
          {slides.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: slideEase }}
              className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-navy-900"
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
                    <img
                      src={getMediaUrl(slide.image)}
                      alt={slide.title || ''}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={() => go(-1)}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow transition-transform duration-200 hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={() => go(1)}
                    className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow transition-transform duration-200 hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {split && (
            <div className={`grid gap-3 ${sideCards.length > 1 ? 'grid-cols-2 min-[960px]:grid-cols-1' : 'grid-cols-1'}`}>
              {sideCards.map((card) => (
                <div
                  key={card.id}
                  className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-navy-900"
                >
                  <img
                    src={getMediaUrl(card.image)}
                    alt={card.title || ''}
                    className="h-full w-full object-cover object-left"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
