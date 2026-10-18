import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function HeroSlider({ banners = [] }) {
  const slides = Array.isArray(banners) ? banners : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (direction) => {
    if (slides.length === 0) return;
    setIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="bg-cream-200">
      <div className="container-custom py-4">
        <div className="relative h-[220px] sm:h-[320px] lg:h-[420px] rounded-2xl overflow-hidden bg-navy-900">
          {slides.length > 0 && (
            <SlideFrame banner={slides[index]}>
              <img
                src={getMediaUrl(slides[index].image)}
                alt=""
                className="w-full h-full object-cover"
              />
            </SlideFrame>
          )}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-navy-900 shadow flex items-center justify-center hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-navy-900 shadow flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
