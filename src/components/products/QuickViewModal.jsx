import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { getMediaUrl } from '@/lib/siteConfig';

export default function QuickViewModal({ product, onClose, onAddToCart, adding, justAdded }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let active = true;
    productsAPI.getProduct(product.slug)
      .then((response) => {
        if (active) setDetail(response.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [product.slug]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const view = detail || product;
  const price = parseFloat(view.price);
  const comparePrice = view.compare_price ? parseFloat(view.compare_price) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const image = detail?.images?.[0]?.image || view.primary_image;
  const summary = view.short_description || view.sku || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close quick view" className="absolute inset-0 bg-charcoal-950/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={view.name}
        className="relative z-10 grid w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-elegant-lg sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-charcoal-700 shadow-md"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex aspect-square items-center justify-center bg-white p-6">
          <img src={getMediaUrl(image)} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col justify-center p-6 pr-12">
          <h2 className="text-lg font-semibold leading-snug text-charcoal-900">{view.name}</h2>
          {summary && <p className="mt-2 text-sm text-charcoal-500">{summary}</p>}
          <p className="mt-4 text-xl font-semibold text-charcoal-900">৳{price.toLocaleString()}</p>
          {hasDiscount && (
            <p className="mt-1 text-sm text-emerald-600">
              Save Tk {Math.round(comparePrice - price).toLocaleString()}
            </p>
          )}
          {view.is_out_of_stock && <p className="mt-2 text-sm text-red-600">Out of stock</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={adding || view.is_out_of_stock}
              className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {justAdded ? 'Added' : 'Add to Cart'}
            </button>
            <Link href={`/product/${view.slug}`} className="rounded-lg border border-cream-500 px-4 py-2.5 text-sm font-semibold text-charcoal-800">
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
