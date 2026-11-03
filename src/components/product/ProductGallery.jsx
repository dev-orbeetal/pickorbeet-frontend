import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Play, X } from 'lucide-react';
import OfficialBadge from '@/components/product/OfficialBadge';
import { useOfficialBadgeStyle } from '@/components/product/OfficialBadgeProvider';
import { productEase } from '@/components/product/motion';
import { officialPlacement } from '@/lib/officialBadge';
import { getMediaUrl } from '@/lib/siteConfig';

function youtubeThumb(id) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '/images/placeholder.svg';
}

function youtubeEmbed(id) {
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : '';
}

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
  media,
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
  const slides = Array.isArray(media) && media.length
    ? media
    : (Array.isArray(images) ? images.map((image, index) => ({
      type: 'image',
      key: `image-${image.id || image.image || index}`,
      ...image,
    })) : []);
  const count = slides.length;
  const current = slides[selected] || slides[0];
  const isVideo = current?.type === 'video';
  const src = isVideo
    ? youtubeThumb(current?.youtube_id)
    : getMediaUrl(current?.image, '/images/placeholder.svg');
  const embed = isVideo ? youtubeEmbed(current?.youtube_id) : '';
  const dragStart = useRef(null);
  const swiped = useRef(false);
  const [zoomed, setZoomed] = useState(false);
  const zoomImages = slides.filter((item) => item.type !== 'video');

  const step = useCallback((delta) => {
    if (count < 2) return;
    onSelect((selected + delta + count) % count);
  }, [count, onSelect, selected]);

  const onPointerDown = (event) => {
    swiped.current = false;
    if (count < 2 || isVideo) return;
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
            {isVideo && embed ? (
              <motion.div
                key={current.key || embed}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: productEase }}
                className="absolute inset-0"
              >
                <iframe
                  title={current.title || `${name} video`}
                  src={embed}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </motion.div>
            ) : (
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
            )}
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
                aria-label="Previous media"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#172033] shadow-[0_2px_8px_rgba(23,32,51,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                onClick={(event) => { event.stopPropagation(); step(1); }}
                aria-label="Next media"
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
            {slides.map((item, index) => {
              const active = index === selected;
              const video = item.type === 'video';
              const thumb = video
                ? youtubeThumb(item.youtube_id)
                : getMediaUrl(item.image, '/images/placeholder.svg');
              return (
                <motion.button
                  key={item.key || `${thumb}-${index}`}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={video ? `Show video ${index + 1}` : `Show image ${index + 1}`}
                  aria-pressed={active}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  animate={{ borderColor: active ? '#2864E8' : 'transparent' }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: productEase }}
                  className="relative h-16 w-[72px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#F7F9FC] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
                >
                  <img src={thumb} alt="" className="h-full w-full rounded-lg object-contain" />
                  {video && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#172033]/7 text-white">
                        <Play className="h-3.5 w-3.5 fill-white" />
                      </span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoomed && zoomImages.length > 0 && (
          <ZoomLightbox
            images={zoomImages}
            name={name}
            index={Math.max(0, zoomImages.findIndex((item) => item.key === current?.key))}
            onClose={() => setZoomed(false)}
            onIndex={(next) => {
              const target = zoomImages[typeof next === 'function' ? next(0) : next];
              if (!target) return;
              const mediaIndex = slides.findIndex((item) => item.key === target.key);
              if (mediaIndex >= 0) onSelect(mediaIndex);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
