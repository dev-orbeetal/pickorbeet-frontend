import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, Star, X } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { getMediaUrl } from '@/lib/siteConfig';
import Stars from '@/components/product/Stars';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'delivery', label: 'Delivery & Returns' },
  { id: 'reviews', label: 'Reviews' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

function aboutCopy(product) {
  const short = String(product.short_description || '').replace(/<[^>]*>/g, '').trim();
  const body = String(product.description || '').trim();
  const bodyPlain = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const usableTitle = short && short.length <= 80 && short !== bodyPlain;
  return {
    title: usableTitle ? short : 'About this product',
    body: body || (usableTitle ? '' : short),
  };
}

function DescriptionBody({ value }) {
  if (!value) {
    return <p className="text-sm leading-relaxed text-[#687386]">The seller has not added a description yet.</p>;
  }
  if (/<[^>]+>/.test(value)) {
    return (
      <div
        className="text-sm leading-relaxed text-[#525E70] [&_a]:text-[#2864E8] [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
  return <p className="whitespace-pre-line text-sm leading-relaxed text-[#525E70]">{value}</p>;
}

function SpecTable({ rows }) {
  if (!rows.length) {
    return <p className="text-sm text-[#687386]">Specifications will appear here once the seller adds them.</p>;
  }
  return (
    <dl>
      {rows.map((row, index) => (
        <div key={`${row.name}-${index}`} className="flex items-baseline justify-between gap-4 border-b border-[#EEF2F7] py-2.5 text-sm">
          <dt className="text-[#8B95A7]">{row.name}</dt>
          <dd className="text-right font-medium text-[#172033]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function reviewError(error) {
  const data = error?.response?.data;
  if (!data) return 'Could not save your review';
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  const images = data.images?.[0] || data.images;
  const comment = data.comment?.[0] || data.comment;
  const rating = data.rating?.[0] || data.rating;
  return images || comment || rating || 'Could not save your review';
}

function ReviewPhotoGrid({ images, onOpen }) {
  if (!images?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((item, index) => {
        const src = getMediaUrl(item.image);
        return (
          <button
            key={item.id || src}
            type="button"
            onClick={() => onOpen?.(src, index)}
            className="h-16 w-16 overflow-hidden rounded-lg bg-[#F1F4F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        );
      })}
    </div>
  );
}

function RatingBreakdown({ average, count, breakdown, ratingFilter, onRating }) {
  const max = Math.max(1, ...Object.values(breakdown || {}).map(Number));
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      <div className="shrink-0">
        <p className="text-3xl font-extrabold text-[#172033]">{count ? Number(average || 0).toFixed(1) : '—'}</p>
        <Stars value={count ? average : 0} size={16} />
        <p className="mt-1 text-sm text-[#687386]">{count} review{count === 1 ? '' : 's'}</p>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const total = Number(breakdown?.[String(star)] || 0);
          const width = count ? Math.round((total / max) * 100) : 0;
          const active = String(ratingFilter) === String(star);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRating(active ? '' : String(star))}
              className={`flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${active ? 'bg-[#F4F8FF]' : 'hover:bg-[#F7F9FC]'}`}
            >
              <span className="w-8 font-medium text-[#172033]">{star}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF2F7]">
                <span className="block h-full rounded-full bg-[#F5B400]" style={{ width: `${width}%` }} />
              </span>
              <span className="w-6 text-right text-[#8B95A7]">{total}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewForm({ product, mine, canReview, onSaved }) {
  const router = useRouter();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [rating, setRating] = useState(mine?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment || '');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRating(mine?.rating || 0);
    setComment(mine?.comment || '');
    setFiles([]);
    setPreviews([]);
  }, [mine?.id, mine?.rating, mine?.comment]);

  useEffect(() => () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  if (!isAuthenticated) {
    const next = router.asPath || `/product/${product.slug}`;
    return (
      <p className="text-sm text-[#525E70]">
        <Link href={`/login?redirect=${encodeURIComponent(next)}`} className="font-semibold text-[#2864E8] hover:underline">
          Sign in
        </Link>
        {' '}to write a review.
      </p>
    );
  }

  if (!canReview && !mine) {
    return (
      <p className="text-sm text-[#687386]">
        Available after delivery — you can review this product once an order with it is delivered.
      </p>
    );
  }

  const onPick = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (!picked.length) return;
    setFiles((current) => {
      const next = [...current, ...picked].slice(0, 5);
      setPreviews((old) => {
        old.forEach((url) => URL.revokeObjectURL(url));
        return next.map((file) => URL.createObjectURL(file));
      });
      return next;
    });
  };

  const removeFile = (index) => {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);
      setPreviews((old) => {
        old.forEach((url) => URL.revokeObjectURL(url));
        return next.map((file) => URL.createObjectURL(file));
      });
      return next;
    });
  };

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
      const body = new FormData();
      body.append('rating', String(rating));
      body.append('comment', comment.trim());
      files.forEach((file) => body.append('images', file));
      await productsAPI.saveReview(product.slug, body);
      toast.success(mine ? 'Review updated' : 'Review published');
      setFiles([]);
      setPreviews((old) => {
        old.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      onSaved();
    } catch (error) {
      toast.error(reviewError(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await productsAPI.deleteReview(product.slug);
      toast.success('Review removed');
      setRating(0);
      setComment('');
      setFiles([]);
      onSaved();
    } catch (error) {
      toast.error(reviewError(error));
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;
  const existingImages = mine?.images || [];

  return (
    <form onSubmit={submit} className="max-w-xl">
      <p className="text-sm font-semibold text-[#172033]">{mine ? 'Your review' : 'Write a review'}</p>
      <div className="mt-2 flex" onMouseLeave={() => setHover(0)}>
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
                size={20}
                className={active ? 'text-[#F5B400]' : 'text-[#E1E6F0]'}
                fill={active ? '#F5B400' : '#E1E6F0'}
                strokeWidth={0}
              />
            </button>
          );
        })}
      </div>
      <label htmlFor="product-review-comment" className="sr-only">Review comment</label>
      <textarea
        id="product-review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="How did this product work for you?"
        className="mt-2 w-full rounded-lg border border-[#E6ECF5] px-3 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#8B95A7] focus-visible:ring-2 focus-visible:ring-[#2864E8]"
      />
      {!!existingImages.length && !files.length && (
        <ReviewPhotoGrid images={existingImages} />
      )}
      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((src, index) => (
            <div key={src} className="relative h-16 w-16 overflow-hidden rounded-lg bg-[#F1F4F9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removeFile(index)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#172033]/70 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex h-11 cursor-pointer items-center rounded-[10px] border border-[#E6ECF5] px-4 text-sm font-semibold text-[#172033] hover:bg-[#F7F9FC] focus-within:ring-2 focus-within:ring-[#2864E8]">
          Add photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={onPick}
          />
        </label>
        <span className="text-xs text-[#8B95A7]">Up to 5 photos. New uploads replace existing ones.</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-[10px] bg-[#2864E8] px-5 text-sm font-semibold text-white hover:bg-[#1F56D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : mine ? 'Update review' : 'Publish review'}
        </button>
        {mine && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="h-11 rounded-[10px] px-4 text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
          >
            Delete review
          </button>
        )}
      </div>
    </form>
  );
}

function ReviewsPanel({
  product,
  reviews,
  reviewsLoading,
  onReviewsChanged,
  reviewQuery,
  onReviewQuery,
}) {
  const [lightbox, setLightbox] = useState(null);
  const results = reviews?.results || [];
  const mine = reviews?.mine || null;
  const canReview = Boolean(reviews?.can_review);
  const breakdown = reviews?.rating_breakdown || {};
  const average = reviews?.average;
  const count = reviews?.count || 0;
  const filteredCount = reviews?.filtered_count ?? results.length;
  const pageSize = 20;
  const page = Number(reviewQuery.page || 1);
  const hasMore = page * pageSize < filteredCount;
  const hasPrev = page > 1;

  return (
    <div id="product-reviews" className="scroll-mt-28 space-y-6">
      <RatingBreakdown
        average={average}
        count={count}
        breakdown={breakdown}
        ratingFilter={reviewQuery.rating}
        onRating={(rating) => onReviewQuery({ rating, page: 1 })}
      />

      <div className="flex flex-wrap items-center gap-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const active = String(reviewQuery.rating) === String(star);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onReviewQuery({ rating: active ? '' : String(star), page: 1 })}
              className={`h-9 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${active ? 'bg-[#172033] text-white' : 'bg-[#F1F4F9] text-[#525E70] hover:bg-[#E6ECF5]'}`}
            >
              {star} stars
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onReviewQuery({ with_photos: !reviewQuery.with_photos, page: 1 })}
          className={`h-9 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${reviewQuery.with_photos ? 'bg-[#172033] text-white' : 'bg-[#F1F4F9] text-[#525E70] hover:bg-[#E6ECF5]'}`}
        >
          With photos
        </button>
        <label className="ml-auto flex items-center gap-2 text-xs text-[#687386]">
          Sort
          <select
            value={reviewQuery.sort || 'newest'}
            onChange={(event) => onReviewQuery({ sort: event.target.value, page: 1 })}
            className="h-9 rounded-lg border border-[#E6ECF5] bg-white px-2 text-sm text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <ReviewForm product={product} mine={mine} canReview={canReview} onSaved={onReviewsChanged} />

      {reviewsLoading && <p className="text-sm text-[#8B95A7]">Loading reviews...</p>}
      {!reviewsLoading && results.length === 0 && (
        <p className="text-sm text-[#687386]">
          {count === 0 ? 'No reviews yet. Be the first to review this product.' : 'No reviews match these filters.'}
        </p>
      )}
      <ul className="divide-y divide-[#EEF2F7]">
        {results.map((review) => (
          <li key={review.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-semibold text-[#172033]">{review.author}</span>
              <Stars value={review.rating} size={13} />
              <span className="text-xs text-[#8B95A7]">
                {new Date(review.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#525E70]">{review.comment}</p>
            <ReviewPhotoGrid
              images={review.images}
              onOpen={(src) => setLightbox(src)}
            />
          </li>
        ))}
      </ul>

      {(hasPrev || hasMore) && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!hasPrev || reviewsLoading}
            onClick={() => onReviewQuery({ page: page - 1 })}
            className="h-10 rounded-lg px-4 text-sm font-semibold text-[#2864E8] hover:bg-[#F4F8FF] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-[#8B95A7]">Page {page}</span>
          <button
            type="button"
            disabled={!hasMore || reviewsLoading}
            onClick={() => onReviewQuery({ page: page + 1 })}
            className="h-10 rounded-lg px-4 text-sm font-semibold text-[#2864E8] hover:bg-[#F4F8FF] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#172033]/70 p-4">
          <button type="button" aria-label="Close photo" className="absolute inset-0" onClick={() => setLightbox(null)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="relative z-10 max-h-[85vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}

export default function ProductInfoTabs({
  product,
  rows,
  tab,
  onTab,
  reviews,
  reviewsLoading,
  onReviewsChanged,
  reviewCount,
  reviewQuery,
  onReviewQuery,
}) {
  const reduce = useReducedMotion();
  const copy = aboutCopy(product);
  const warranty = String(product.warranty_period || '').trim();
  const query = useMemo(() => ({
    sort: 'newest',
    rating: '',
    with_photos: false,
    page: 1,
    ...(reviewQuery || {}),
  }), [reviewQuery]);

  let panel = null;
  if (tab === 'description') {
    panel = (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]">
        <div>
          <h2 className="text-lg font-semibold text-[#172033]">{copy.title}</h2>
          <div className="mt-3">
            <DescriptionBody value={copy.body} />
          </div>
          {warranty && (
            <section className="mt-5 rounded-xl border border-[#D6E4FF] bg-[#F4F8FF] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
                <ShieldCheck className="h-4 w-4 text-[#2864E8]" aria-hidden="true" />
                Warranty
              </h3>
              <p className="mt-2 text-base font-semibold text-[#172033]">{warranty}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#525E70]">
                Covered for {warranty} from the day the order is delivered, for manufacturing defects. Keep the invoice if you need to make a claim.
              </p>
            </section>
          )}
        </div>
        <div className="lg:border-l lg:border-[#EEF2F7] lg:pl-6">
          <SpecTable rows={rows} />
        </div>
      </div>
    );
  } else if (tab === 'specifications') {
    panel = <SpecTable rows={rows} />;
  } else if (tab === 'delivery') {
    panel = (
      <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-[#525E70]">
        <p>Delivery is available across Bangladesh. Cash on delivery means you pay when the order arrives.</p>
        <p>You can request a return within 3 days of receiving the product. The item needs to be unused, in its original condition, with tags and packaging intact.</p>
        <p>Damaged, defective, or wrong items can be returned. PickOrbeet covers the return delivery when the mistake is ours.</p>
        <p>
          <Link href="/returns" className="font-semibold text-[#2864E8] hover:underline">
            Read the full return policy
          </Link>
        </p>
      </div>
    );
  } else {
    panel = (
      <ReviewsPanel
        product={product}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        onReviewsChanged={onReviewsChanged}
        reviewQuery={query}
        onReviewQuery={(patch) => onReviewQuery?.((current) => ({ ...current, ...patch }))}
      />
    );
  }

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-[#E6ECF5]" role="tablist" aria-label="Product information">
        {TABS.map((item) => {
          const active = tab === item.id;
          const label = item.id === 'reviews' ? `Reviews (${reviewCount})` : item.label;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`product-tab-${item.id}`}
              aria-selected={active}
              aria-controls="product-tab-panel"
              onClick={() => onTab(item.id)}
              className={`relative flex min-h-11 shrink-0 items-center pb-0 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:min-h-0 lg:items-end lg:pb-3 ${active ? 'font-semibold text-[#172033]' : 'text-[#687386] hover:text-[#172033]'}`}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="product-tab-underline"
                  className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#FF7A1A]"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id="product-tab-panel"
          role="tabpanel"
          aria-labelledby={`product-tab-${tab}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          className="pt-5"
        >
          {panel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
