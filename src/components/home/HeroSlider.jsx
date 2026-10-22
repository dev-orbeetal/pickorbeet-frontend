import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function ordered(items) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function BannerLink({ href, className, children, label }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('http')) {
    return <a href={href} className={className} aria-label={label}>{children}</a>;
  }
  return <Link href={href} className={className} aria-label={label}>{children}</Link>;
}

export default function HeroSlider({ banners = [], cards = [] }) {
  const slides = ordered(Array.isArray(banners) ? banners : []).filter((banner) => banner?.image);
  const sideCards = ordered(Array.isArray(cards) ? cards : []).filter((banner) => banner?.image).slice(0, 2);
  const split = sideCards.length > 0;
  const [[index, direction], setSlide] = useState([0, 0]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setSlide([0, 0]);
  }, [slides.length]);

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setSlide(([current]) => [(current + 1) % slides.length, 1]);
    }, 5000);
    return () => clearInterval(timer);
  }, [reducedMotion, slides.length]);

  const go = (step) => {
    if (slides.length === 0) return;
    setSlide(([current]) => [(current + step + slides.length) % slides.length, step]);
  };

  const slide = slides[index];
  if (slides.length === 0 && sideCards.length === 0) return null;

  return (
    <section className="bg-cream-200" aria-label="Promotions">
      <div className="container-custom py-3 sm:py-4">
        <div className={`grid items-start gap-2.5 sm:gap-3 ${split ? 'min-[960px]:[grid-template-columns:minmax(0,calc((200%+0.75rem)/3))_minmax(0,calc((100%-3rem)/3))]' : ''}`}>
          {slides.length > 0 && (
            <div>
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-navy-900 sm:aspect-[2.2/1] min-[960px]:aspect-[3/1]">
                <AnimatePresence initial={false} custom={direction}>
                  {slide && (
                    <motion.div
                      key={slide.id || index}
                      custom={direction}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction >= 0 ? 28 : -28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction >= 0 ? -28 : 28 }}
                      transition={{ duration: reducedMotion ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <BannerLink
                        href={slide.link}
                        label={slide.title || slide.button_label || 'Shop promotion'}
                        className="block h-full w-full"
                      >
                        <img
                          src={getMediaUrl(slide.image)}
                          alt={slide.title || 'Promotional banner'}
                          width={1200}
                          height={400}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'low'}
                          decoding="async"
                          className="h-full w-full object-contain object-center min-[960px]:object-cover"
                        />
                      </BannerLink>
                    </motion.div>
                  )}
                </AnimatePresence>

                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={() => go(-1)}
                      className="absolute bottom-1 left-0.5 z-10 flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action min-[960px]:bottom-auto min-[960px]:left-2 min-[960px]:top-1/2 min-[960px]:-translate-y-1/2"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow">
                        <ChevronLeft className="h-5 w-5" />
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={() => go(1)}
                      className="absolute bottom-1 right-0.5 z-10 flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action min-[960px]:bottom-auto min-[960px]:right-2 min-[960px]:top-1/2 min-[960px]:-translate-y-1/2"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </button>
                  </>
                )}
              </div>

              {slides.length > 1 && (
                <div className="mt-2 flex items-center justify-center" role="tablist" aria-label="Promotion slides">
                  {slides.map((item, itemIndex) => {
                    const active = itemIndex === index;
                    return (
                      <button
                        key={item.id || itemIndex}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={`Show slide ${itemIndex + 1}`}
                        onClick={() => setSlide([itemIndex, itemIndex > index ? 1 : -1])}
                        className="flex h-8 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                      >
                        <span className={`block h-1.5 rounded-full ${active ? 'w-4 bg-gold-500' : 'w-1.5 bg-navy-900/25'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {split && (
            <div className={`grid gap-2.5 ${sideCards.length > 1 ? 'grid-cols-2 min-[960px]:grid-cols-1 min-[960px]:gap-3' : 'grid-cols-1'}`}>
              {sideCards.map((card) => (
                <BannerLink
                  key={card.id}
                  href={card.link || '/products'}
                  label={`${card.title || 'Promotion'}. Shop now`}
                  className="group relative block overflow-hidden rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <span className="relative block aspect-[3/1] overflow-hidden bg-navy-900">
                    <img
                      src={getMediaUrl(card.image)}
                      alt={card.title || 'Promotion'}
                      width={640}
                      height={214}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain object-center"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-1 bg-white px-2 py-1.5 text-[11px] font-bold text-navy-900 min-[960px]:absolute min-[960px]:bottom-2 min-[960px]:left-2 min-[960px]:w-auto min-[960px]:rounded-full min-[960px]:px-2.5 min-[960px]:py-1 min-[960px]:shadow-sm">
                    {card.button_label || 'Shop Now'}
                    <ChevronRight className="h-3.5 w-3.5 min-[960px]:hidden" aria-hidden="true" />
                  </span>
                </BannerLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
