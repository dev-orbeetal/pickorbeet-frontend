import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Banknote, Check, CreditCard, MapPin, Minus, Package, Plus, Share2, ShieldCheck, ShoppingCart, Zap,
} from 'lucide-react';
import { matchesInsideDhaka, money } from '@/lib/delivery';
import { swatchHex } from '@/lib/colorSwatch';
import Stars from '@/components/product/Stars';
import { productEase } from '@/components/product/motion';

function taka(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `৳${Math.round(amount).toLocaleString()}`;
}

const TRUST = [
  { icon: ShieldCheck, title: '100% Original', text: 'Trusted Quality' },
  { icon: CreditCard, title: 'Secure Payment', text: 'Multiple Options' },
  { icon: Package, title: 'Easy Returns', text: 'Hassle Free' },
];

export default function ProductPurchase({
  product,
  displayPrice,
  hasDiscount,
  comparePrice,
  savedAmount,
  discount,
  groups = [],
  selected = {},
  onSelect,
  quantity,
  onQuantity,
  stockLimit,
  stockState,
  average,
  reviewCount,
  onWriteReview,
  onAdd,
  onBuy,
  pending,
  justAdded,
  purchaseDisabled,
  flat = false,
}) {
  const reduce = useReducedMotion();
  const { deliveryInside, deliveryOutside } = useSelector((state) => state.cart);
  const [area, setArea] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [deliveryError, setDeliveryError] = useState('');

  const eyebrow = [product.category?.name, product.subcategory?.name].filter(Boolean).join(' / ');
  const ratingLabel = reviewCount > 0 && average != null
    ? `${Number(average).toFixed(1)} out of 5 from ${reviewCount} reviews`
    : 'No reviews yet';

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      } catch {
        toast.error('Could not share');
      }
    }
  };

  const checkDelivery = (event) => {
    event.preventDefault();
    const query = area.trim();
    if (!query) {
      setDeliveryResult(null);
      setDeliveryError('Enter an area or postal code');
      return;
    }
    const inside = matchesInsideDhaka(query);
    const charge = Number(inside ? deliveryInside : deliveryOutside);
    const place = inside ? 'Inside Dhaka' : 'Outside Dhaka';
    const fee = Number.isFinite(charge) && charge > 0 ? ` · ৳${money(charge)}` : '';
    setDeliveryError('');
    setDeliveryResult(`Delivery available · ${place}${fee}. Cash on delivery.`);
  };

  const shell = flat
    ? 'flex h-full flex-col'
    : 'flex h-full flex-col rounded-2xl border border-[#E6ECF5] bg-white p-5 shadow-[0_8px_24px_rgba(23,32,51,0.05)] sm:p-6';

  return (
    <div className={shell}>
      {!flat && eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8B95A7]">{eyebrow}</p>
      )}

      <div className={`flex items-start gap-2 ${flat ? '' : 'mt-1'}`}>
        <h1 className={`min-w-0 flex-1 text-[22px] font-extrabold leading-[1.2] text-[#172033] ${flat ? '' : 'md:text-[28px]'}`}>
          {product.name}
        </h1>
        <motion.button
          type="button"
          onClick={share}
          aria-label="Share product"
          whileTap={reduce ? undefined : { scale: 0.92 }}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center text-[#2864E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          <Share2 className="h-5 w-5" strokeWidth={2.1} />
        </motion.button>
      </div>

      {product.sku && (
        <p className="mt-1 text-[13px] font-medium text-[#8B95A7]">
          SKU: <span className="text-[#687386]">{product.sku}</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="sr-only">{ratingLabel}</span>
        <Stars value={reviewCount > 0 ? average : 0} empty="#E4E8F0" />
        {reviewCount > 0 && average != null && (
          <span className="text-[13px] font-semibold text-[#172033]">{Number(average).toFixed(1)}</span>
        )}
        <span className="text-[13px] text-[#8B95A7]">({reviewCount} reviews)</span>
        <button
          type="button"
          onClick={onWriteReview}
          className="text-[13px] font-medium text-[#2864E8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          Write a review
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="text-[30px] font-extrabold leading-none text-[#172033]">{taka(displayPrice)}</span>
        {hasDiscount && (
          <span className="text-base text-[#A3ADBD] line-through">{taka(comparePrice)}</span>
        )}
        {hasDiscount && (
          <span className="inline-flex items-center rounded-full bg-[#E7F6EE] px-2.5 py-1 text-xs font-semibold text-[#16835B]">
            You save {taka(savedAmount)} ({discount}%)
          </span>
        )}
      </div>

      {groups.map((group) => {
        const current = selected[group.name] || '';
        return (
          <div key={group.name} className="mt-3.5">
            <p className="text-sm text-[#172033]">
              {group.name}:{' '}
              <span className={current ? 'font-bold' : 'font-medium'}>{current || 'Select'}</span>
            </p>
            {group.kind === 'swatch' ? (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const active = current === value.label;
                  const hex = swatchHex(value.label, value.colorHex);
                  return (
                    <motion.button
                      key={value.label}
                      type="button"
                      onClick={() => onSelect?.(group.name, value.label)}
                      aria-label={value.label}
                      aria-pressed={active}
                      whileTap={reduce ? undefined : { scale: 0.97 }}
                      animate={{ borderColor: active ? '#2864E8' : '#E6ECF5' }}
                      transition={{ duration: reduce ? 0 : 0.22, ease: productEase }}
                      className={`inline-flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] px-3 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${
                        active ? 'font-bold text-[#172033]' : 'font-medium text-[#525E70]'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: hex || '#D5DDE8',
                          boxShadow: hex
                            ? '0 0 0 1px rgba(23,32,51,0.08)'
                            : 'inset 0 0 0 1px #C5CDD8',
                        }}
                      />
                      {value.label}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const active = current === value.label;
                  return (
                    <motion.button
                      key={value.label}
                      type="button"
                      onClick={() => onSelect?.(group.name, value.label)}
                      aria-pressed={active}
                      whileTap={reduce ? undefined : { scale: 0.97 }}
                      className={`h-10 min-w-10 rounded-lg border px-3.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] ${
                        active
                          ? 'border-[1.5px] border-[#172033] font-bold text-[#172033]'
                          : 'border-[#E6ECF5] font-semibold text-[#525E70]'
                      }`}
                    >
                      {value.label}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#172033]">Quantity:</span>
        <div className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-[#E6ECF5]">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="flex h-9 w-[34px] items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2864E8]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-7 text-center text-sm font-semibold text-[#172033]">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantity(stockLimit > 0 ? Math.min(stockLimit, quantity + 1) : quantity)}
            disabled={!stockLimit || quantity >= stockLimit}
            aria-label="Increase quantity"
            className="flex h-9 w-[34px] items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2864E8] disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <StockLine state={stockState} stockLimit={stockLimit} />
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <motion.button
          type="button"
          onClick={onAdd}
          disabled={purchaseDisabled || pending}
          whileTap={reduce || purchaseDisabled ? undefined : { scale: 0.98 }}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#FF7A1A] text-[15px] font-bold text-white hover:bg-[#F06E0C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {justAdded ? <Check className="h-[18px] w-[18px]" /> : <ShoppingCart className="h-[18px] w-[18px]" />}
          <span>{justAdded ? 'Added' : pending === 'cart' ? 'Adding...' : 'Add to Cart'}</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={onBuy}
          disabled={purchaseDisabled || pending}
          whileTap={reduce || purchaseDisabled ? undefined : { scale: 0.98 }}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#2864E8] bg-white text-[15px] font-bold text-[#2864E8] hover:bg-[#F4F7FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap className="h-[18px] w-[18px]" />
          <span>{pending === 'buy' ? 'Please wait...' : 'Buy Now'}</span>
        </motion.button>
      </div>

      <ul className={`mt-4 grid grid-cols-3 gap-2 ${flat ? '' : 'border-t border-[#EEF2F7] pt-4'}`}>
        {TRUST.map((item) => (
          <li key={item.title} className="flex items-start gap-1.5">
            <item.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#2864E8]" aria-hidden="true" />
            <span>
              <span className="block text-[11px] font-bold leading-[1.2] text-[#172033]">{item.title}</span>
              <span className="mt-0.5 block text-[10px] leading-[1.2] text-[#8B95A7]">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={`mt-4 ${flat ? 'rounded-2xl border border-[#E6ECF5] bg-white p-3' : 'border-t border-[#EEF2F7] pt-4'}`}>
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#172033]">
          <MapPin className="h-4 w-4 text-[#2864E8]" aria-hidden="true" />
          Check delivery availability
        </p>
        <form onSubmit={checkDelivery} className="mt-2.5 flex flex-wrap items-stretch gap-2">
          <input
            type="text"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Enter your area or postal code"
            aria-label="Area or postal code"
            className="h-10 min-w-0 flex-1 rounded-lg border border-[#E6ECF5] px-3 text-[13px] text-[#172033] outline-none placeholder:text-[#8B95A7] focus-visible:ring-2 focus-visible:ring-[#2864E8]"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-[#2864E8] px-3.5 text-[13px] font-bold text-white hover:bg-[#1F56D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2"
          >
            Check
          </button>
          <div className="inline-flex items-center gap-1 rounded-lg border border-[#D7F0E4] bg-[#E7F6EE] px-2 py-1">
            <Banknote className="h-3.5 w-3.5 shrink-0 text-[#16835B]" aria-hidden="true" />
            <span>
              <span className="block text-[10px] font-bold leading-[1.15] text-[#16835B]">Cash on Delivery</span>
              <span className="block text-[9px] leading-[1.15] text-[#8B95A7]">Pay when you receive</span>
            </span>
          </div>
        </form>
        <AnimatePresence initial={false}>
          {(deliveryError || deliveryResult) && (
            <motion.p
              key={deliveryError || deliveryResult}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: productEase }}
              className={`overflow-hidden text-[13px] font-semibold ${deliveryError ? 'text-red-600' : 'text-[#16835B]'}`}
            >
              <span className="mt-2 block">{deliveryError || deliveryResult}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StockLine({ state, stockLimit }) {
  if (state === 'out') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-red-600">
        <span className="h-[7px] w-[7px] rounded-full bg-red-600" />
        Out of stock
      </span>
    );
  }
  if (state === 'low') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#EA6C04]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#EA6C04]" />
        Only {stockLimit} left
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
      <span className="inline-flex items-center gap-1.5 font-medium text-[#16835B]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#16835B]" />
        In stock
      </span>
      <span className="text-[#8B95A7]">Ready to ship</span>
    </span>
  );
}
