import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, X } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { productEase } from '@/components/product/motion';

function reviewError(error) {
  const data = error?.response?.data;
  if (!data) return 'Could not save your review';
  if (typeof data.detail === 'string') return data.detail;
  const comment = data.comment?.[0] || data.comment;
  const rating = data.rating?.[0] || data.rating;
  return comment || rating || 'Could not save your review';
}

export default function ProductReviewSheet({ open, onClose, product, mine, onSaved }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [rating, setRating] = useState(mine?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setRating(mine?.rating || 0);
    setComment(mine?.comment || '');
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, mine?.rating, mine?.comment, onClose]);

  const submit = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.error('Choose a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Write a short comment with your rating');
      return;
    }
    setSaving(true);
    try {
      await productsAPI.saveReview(product.slug, { rating, comment: comment.trim() });
      toast.success(mine ? 'Review updated' : 'Review published');
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(reviewError(error));
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;
  const next = router.asPath || `/product/${product.slug}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close review sheet"
            className="absolute inset-0 bg-[#172033]/45"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Write a review"
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: '100%' }}
            transition={{ duration: reduce ? 0 : 0.32, ease: productEase }}
            className="relative z-10 w-full max-w-lg rounded-t-[20px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl lg:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#172033]">{mine ? 'Your review' : 'Write a review'}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F4F9] text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isAuthenticated ? (
              <p className="text-sm text-[#525E70]">
                <Link href={`/login?redirect=${encodeURIComponent(next)}`} className="font-semibold text-[#2864E8] hover:underline">
                  Sign in
                </Link>
                {' '}to write a review.
              </p>
            ) : (
              <form onSubmit={submit}>
                <div className="flex" onMouseLeave={() => setHover(0)}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    const active = value <= shown;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? '' : 's'}`}
                        onMouseEnter={() => setHover(value)}
                        onFocus={() => setHover(value)}
                        onBlur={() => setHover(0)}
                        onClick={() => setRating(value)}
                        className="flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
                      >
                        <Star
                          size={22}
                          className={active ? 'text-[#F5B400]' : 'text-[#E4E8F0]'}
                          fill={active ? '#F5B400' : '#E4E8F0'}
                          strokeWidth={0}
                        />
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="mobile-product-review" className="sr-only">Review comment</label>
                <textarea
                  id="mobile-product-review"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="How did this product work for you?"
                  className="mt-2 w-full rounded-lg border border-[#E6ECF5] px-3 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#8B95A7] focus-visible:ring-2 focus-visible:ring-[#2864E8]"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-[10px] bg-[#2864E8] text-sm font-bold text-white hover:bg-[#1F56D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : mine ? 'Update review' : 'Publish review'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
