import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, Star } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import Stars from '@/components/product/Stars';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'delivery', label: 'Delivery & Returns' },
  { id: 'reviews', label: 'Reviews' },
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
  const comment = data.comment?.[0] || data.comment;
  const rating = data.rating?.[0] || data.rating;
  return comment || rating || 'Could not save your review';
}

function ReviewForm({ product, mine, onSaved }) {
  const router = useRouter();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [rating, setRating] = useState(mine?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRating(mine?.rating || 0);
    setComment(mine?.comment || '');
  }, [mine?.id, mine?.rating, mine?.comment]);

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
      onSaved();
    } catch (error) {
      toast.error(reviewError(error));
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;

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

export default function ProductInfoTabs({
  product,
  rows,
  tab,
  onTab,
  reviews,
  reviewsLoading,
  onReviewsChanged,
  reviewCount,
}) {
  const reduce = useReducedMotion();
  const copy = aboutCopy(product);
  const warranty = String(product.warranty_period || '').trim();
  const results = reviews?.results || [];
  const mine = reviews?.mine || null;

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
      <div id="product-reviews" className="scroll-mt-28 space-y-6">
        <ReviewForm product={product} mine={mine} onSaved={onReviewsChanged} />
        {reviewsLoading && <p className="text-sm text-[#8B95A7]">Loading reviews...</p>}
        {!reviewsLoading && results.length === 0 && (
          <p className="text-sm text-[#687386]">No reviews yet. Be the first to review this product.</p>
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
            </li>
          ))}
        </ul>
      </div>
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
