import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import OfficialBadge from '@/components/product/OfficialBadge';
import { useOfficialBadgeStyle } from '@/components/product/OfficialBadgeProvider';
import { productEase } from '@/components/product/motion';
import { officialPlacement } from '@/lib/officialBadge';
import { getMediaUrl } from '@/lib/siteConfig';

function ZoomLightbox({ images, name, index, onClose, onIndex }) {
  const reduce = useReducedMotion();
  const count = images.length;
  const src = getMediaUrl(images[index]?.image, '/images/placeholder.svg');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setScale(1);
  }, [index]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && count > 1) onIndex((index - 1 + count) % count);
      if (event.key === 'ArrowRight' && count > 1) onIndex((index + 1) % count);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [count, index, onClose, onIndex]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} image ${index + 1}`}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.28, ease: productEase }}
      className="fixed inset-0 z-[80] flex flex-col bg-[#051340]/96"
    >
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
          {index + 1}/{count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <img
          src={src}
          alt={name}
          draggable={false}
          onWheel={(event) => {
            event.preventDefault();
            const next = scale + (event.deltaY < 0 ? 0.12 : -0.12);
            setScale(Math.min(4, Math.max(1, next)));
          }}
          style={{ transform: `scale(${scale})` }}
          className="max-h-full max-w-full touch-none select-none object-contain transition-transform duration-150"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => onIndex((index - 1 + count) % count)}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#172033] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => onIndex((index + 1) % count)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#172033] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function ProductGallery({
  images,
  name,
  selected,
  onSelect,
  discount,
  official = false,
  saved,
  onToggleSaved,
  flat = false,
}) {
  const reduce = useReducedMotion();
  const place = officialPlacement(useOfficialBadgeStyle(), false, official);
  const count = images.length;
  const current = images[selected] || images[0];
  const src = getMediaUrl(current?.image, '/images/placeholder.svg');
  const dragStart = useRef(null);
  const swiped = useRef(false);
  const [zoomed, setZoomed] = useState(false);

  const step = useCallback((delta) => {
    if (count < 2) return;
    onSelect((selected + delta + count) % count);
  }, [count, onSelect, selected]);

  const onPointerDown = (event) => {
    swiped.current = false;
    if (count < 2) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    step(dx < 0 ? 1 : -1);
  };

  const shell = flat
    ? 'flex h-full flex-col rounded-2xl bg-white p-2 shadow-[0_8px_24px_rgba(23,32,51,0.05)]'
    : 'flex h-full flex-col rounded-2xl border border-[#E6ECF5] bg-white p-3 shadow-[0_8px_24px_rgba(23,32,51,0.05)]';

  return (
    <>
      <div className={shell}>
        <div
          className={`relative aspect-[1.42] overflow-hidden rounded-xl bg-[#F7F9FC] ${flat ? '' : 'lg:aspect-[4/3]'}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragStart.current = null; }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.button
              key={src}
              type="button"
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false;
                  return;
                }
                setZoomed(true);
              }}
              aria-label={`View ${name} fullscreen`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: productEase }}
              className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2864E8]"
            >
              <img src={src} alt={name} className="h-full w-full object-contain" draggable={false} />
            </motion.button>
          </AnimatePresence>

          {official && (
            <span className={place.badgeClass}>
              <OfficialBadge />
            </span>
          )}

          {discount > 0 && (
            <span className={`absolute left-2 z-10 rounded-lg bg-[#FF7A1A] px-2 py-[5px] text-xs font-bold leading-none text-white ${place.discountTop}`}>
              -{discount}%
            </span>
          )}

          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSaved?.();
            }}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            whileTap={reduce ? undefined : { scale: saved ? 0.9 : 1.18 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 14 }}
            className={`absolute right-1.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#E6ECF5] bg-white text-[#424D63] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${place.heartTop}`}
          >
            <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-[#FC3D55] text-[#FC3D55]' : ''}`} />
          </motion.button>

          {count > 1 && (
            <>
              <motion.button
                type="button"
                onClick={(event) => { event.stopPropagation(); step(-1); }}
                aria-label="Previous image"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#172033] shadow-[0_2px_8px_rgba(23,32,51,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                onClick={(event) => { event.stopPropagation(); step(1); }}
                aria-label="Next image"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#172033] shadow-[0_2px_8px_rgba(23,32,51,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
              <span className="absolute bottom-2 right-2 z-10 rounded-full bg-[#172033]/55 px-2 py-1 text-[10px] font-bold leading-none text-white">
                {selected + 1}/{count}
              </span>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
            {images.map((image, index) => {
              const active = index === selected;
              const thumb = getMediaUrl(image.image, '/images/placeholder.svg');
              return (
                <motion.button
                  key={image.id || `${thumb}-${index}`}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={active}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  animate={{ borderColor: active ? '#2864E8' : 'transparent' }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: productEase }}
                  className="h-16 w-[72px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#F7F9FC] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
                >
                  <img src={thumb} alt="" className="h-full w-full rounded-lg object-contain" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoomed && (
          <ZoomLightbox
            images={images}
            name={name}
            index={selected}
            onClose={() => setZoomed(false)}
            onIndex={onSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
}
