import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

export default function ProductGallery({
  images,
  name,
  selected,
  onSelect,
  discount,
  saved,
  onToggleSaved,
}) {
  const reduce = useReducedMotion();
  const count = images.length;
  const current = images[selected] || images[0];
  const src = getMediaUrl(current?.image, '/images/placeholder.svg');

  const step = (delta) => {
    if (count < 2) return;
    onSelect((selected + delta + count) % count);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E6ECF5] bg-white p-3 shadow-[0_8px_24px_rgba(23,32,51,0.05)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F7F9FC]">
        <AnimatePresence initial={false}>
          <motion.img
            key={src}
            src={src}
            alt={name}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.24 }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </AnimatePresence>

        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-lg bg-[#FF7A1A] px-2 py-1 text-xs font-bold leading-none text-white">
            -{discount}%
          </span>
        )}

        <motion.button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          whileTap={reduce ? undefined : { scale: 1.15 }}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#E6ECF5] bg-white text-[#687386] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-9 lg:w-9"
        >
          <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-[#FF7A1A] text-[#FF7A1A]' : ''}`} />
        </motion.button>

        {count > 1 && (
          <>
            <motion.button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6ECF5] bg-white text-[#172033] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-9 lg:w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6ECF5] bg-white text-[#172033] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-9 lg:w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>

      {count > 0 && (
        <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-0.5">
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
                className={`h-[72px] w-[calc((100%-30px)/4)] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${active ? 'border-[#2864E8]' : 'border-transparent'}`}
              >
                <img src={thumb} alt="" className="h-full w-full object-contain" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
