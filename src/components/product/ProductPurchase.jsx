import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Banknote, Check, FileText, MapPin, Minus, Package, Plus, ShieldCheck, ShoppingCart, Zap,
} from 'lucide-react';
import { matchesInsideDhaka, money } from '@/lib/delivery';
import { swatchHex } from '@/lib/colorSwatch';
import Stars from '@/components/product/Stars';

function taka(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return `৳${Math.round(amount).toLocaleString()}`;
}

const TRUST = [
  { icon: ShieldCheck, title: 'Genuine products', text: '100% authentic' },
  { icon: FileText, title: 'Secure checkout', text: 'Multiple payment options' },
  { icon: Package, title: 'Easy returns', text: 'Hassle free within 3 days' },
];

export default function ProductPurchase({
  product,
  displayPrice,
  hasDiscount,
  comparePrice,
  savedAmount,
  discount,
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColor,
  onSize,
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

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E6ECF5] bg-white p-5 shadow-[0_8px_24px_rgba(23,32,51,0.05)] sm:p-6">
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8B95A7]">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-[22px] font-bold leading-tight text-[#172033] md:text-[28px]">{product.name}</h1>
      {product.sku && (
        <p className="mt-1 text-[13px] text-[#8B95A7]">
          Product Code: <span className="text-[#687386]">{product.sku}</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="sr-only">{ratingLabel}</span>
        <Stars value={reviewCount > 0 ? average : 0} />
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

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[32px] font-bold leading-none text-[#172033]">{taka(displayPrice)}</span>
        {hasDiscount && (
          <span className="text-base text-[#A3ADBD] line-through">{taka(comparePrice)}</span>
        )}
        {hasDiscount && (
          <span className="text-sm font-medium text-[#16835B]">
            You save {taka(savedAmount)} ({discount}%)
          </span>
        )}
      </div>

      {colors.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-[#172033]">
            Color: <span className="font-medium">{selectedColor || colors[0]}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap">
            {colors.map((color) => {
              const selected = selectedColor === color;
              const hex = swatchHex(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onColor(color)}
                  aria-label={color}
                  aria-pressed={selected}
                  className="flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-9 lg:w-9"
                >
                  <motion.span
                    className="block h-7 w-7 rounded-full"
                    style={{ backgroundColor: hex || '#D5DDE8' }}
                    animate={{
                      boxShadow: selected
                        ? '0 0 0 2px #ffffff, 0 0 0 4px #172033'
                        : (hex ? '0 0 0 1px rgba(23,32,51,0.08)' : 'inset 0 0 0 1px #C5CDD8'),
                    }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 32 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-[#172033]">
            Size: <span className="font-medium">{selectedSize || 'Select'}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const selected = selectedSize === size;
              return (
                <motion.button
                  key={size}
                  type="button"
                  onClick={() => onSize(size)}
                  aria-pressed={selected}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  className={`h-11 min-w-11 rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-9 ${selected ? 'border-[#172033] font-semibold text-[#172033]' : 'border-[#E6ECF5] text-[#525E70]'}`}
                >
                  {size}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#172033]">Quantity:</span>
        <div className="inline-flex items-center rounded-lg border border-[#E6ECF5]">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2864E8] lg:h-9 lg:w-9"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-[#172033]">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantity(stockLimit > 0 ? Math.min(stockLimit, quantity + 1) : quantity)}
            disabled={!stockLimit || quantity >= stockLimit}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2864E8] disabled:opacity-40 lg:h-9 lg:w-9"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <StockLine state={stockState} stockLimit={stockLimit} />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={onAdd}
          disabled={purchaseDisabled || pending}
          whileTap={reduce || purchaseDisabled ? undefined : { scale: 0.98 }}
          className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#FF7A1A] text-[15px] font-semibold text-white hover:bg-[#F06E0C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
        >
          {justAdded ? <Check className="h-[18px] w-[18px]" /> : <ShoppingCart className="h-[18px] w-[18px]" />}
          <span>{justAdded ? 'Added' : pending === 'cart' ? 'Adding...' : 'Add to Cart'}</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={onBuy}
          disabled={purchaseDisabled || pending}
          whileTap={reduce || purchaseDisabled ? undefined : { scale: 0.98 }}
          className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#2864E8] bg-white text-[15px] font-semibold text-[#2864E8] hover:bg-[#F4F7FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
        >
          <Zap className="h-[18px] w-[18px]" />
          <span>{pending === 'buy' ? 'Please wait...' : 'Buy Now'}</span>
        </motion.button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 border-t border-[#EEF2F7] pt-4 sm:grid-cols-3">
        {TRUST.map((item) => (
          <li key={item.title} className="flex items-start gap-2">
            <item.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#2864E8]" aria-hidden="true" />
            <span>
              <span className="block text-[13px] font-semibold leading-4 text-[#172033]">{item.title}</span>
              <span className="mt-0.5 block text-[11px] leading-4 text-[#687386]">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-[#EEF2F7] pt-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
          <MapPin className="h-4 w-4 text-[#2864E8]" aria-hidden="true" />
          Check delivery availability
        </p>
        <form onSubmit={checkDelivery} className="mt-3 flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <input
            type="text"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Enter your area or postal code"
            aria-label="Area or postal code"
            className="h-11 min-w-0 flex-1 rounded-lg border border-[#E6ECF5] px-3 text-sm text-[#172033] outline-none placeholder:text-[#8B95A7] focus-visible:ring-2 focus-visible:ring-[#2864E8] lg:h-10"
          />
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2864E8] px-5 text-sm font-semibold text-white hover:bg-[#1F56D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8] focus-visible:ring-offset-2 lg:h-10"
          >
            Check
          </button>
          <div className="flex items-center gap-2 rounded-lg border border-[#D7F0E4] bg-[#F3FBF7] px-3 py-2 lg:max-w-[220px]">
            <Banknote className="h-4 w-4 shrink-0 text-[#16835B]" aria-hidden="true" />
            <span>
              <span className="block text-xs font-semibold leading-4 text-[#16835B]">Cash on Delivery available</span>
              <span className="block text-[11px] leading-4 text-[#687386]">Pay when you receive</span>
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
              transition={{ duration: reduce ? 0 : 0.2 }}
              className={`overflow-hidden text-sm ${deliveryError ? 'text-red-600' : 'text-[#16835B]'}`}
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
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
        Out of stock
      </span>
    );
  }
  if (state === 'low') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E86E00]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E86E00]" />
        Only {stockLimit} left
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1.5 font-medium text-[#16835B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#16835B]" />
        In stock
      </span>
      <span className="text-[#8B95A7]">Ready to ship</span>
    </span>
  );
}
