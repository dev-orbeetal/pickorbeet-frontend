import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Heart, Search, ShoppingCart } from 'lucide-react';
import { productEase } from '@/components/product/motion';

const searchButton =
  'flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F4F9] text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]';

export default function ProductMobileBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const { totalItems } = useSelector((state) => state.cart);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const prevCount = useRef(totalItems);
  const badge = totalItems > 99 ? '99+' : String(totalItems);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (totalItems > prevCount.current) {
      setWiggle(true);
      const timer = window.setTimeout(() => setWiggle(false), 480);
      prevCount.current = totalItems;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = totalItems;
    return undefined;
  }, [totalItems]);

  const back = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white lg:hidden">
      <div className="flex h-14 items-center px-1 pl-0 pr-1">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <Link
          href="/"
          aria-label="PickOrbeet"
          className="flex min-w-0 items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          <img src="/images/logo.png" alt="" width={26} height={28} className="h-7 w-[26px] object-contain" />
          <span className="truncate text-[17px] font-extrabold leading-none tracking-[-0.04em] text-[#0C49D8]">
            Pick<span className="text-[#FF7A1A]">Orbeet</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-0.5 pr-1">
          <motion.button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            className={searchButton}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </motion.button>
          <motion.div whileTap={reduce ? undefined : { scale: 0.92 }}>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
            >
              <Heart className="h-[22px] w-[22px]" strokeWidth={2} />
            </Link>
          </motion.div>
          <motion.div
            animate={wiggle && !reduce ? { rotate: [0, -10, 8, -5, 0] } : { rotate: 0 }}
            transition={{ duration: 0.45, ease: productEase }}
          >
            <Link
              href="/cart"
              aria-label={totalItems ? `Cart, ${totalItems} items` : 'Cart'}
              className="relative flex h-11 w-11 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2.1} />
              {totalItems > 0 && (
                <motion.span
                  key={badge}
                  initial={reduce ? false : { scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 14 }}
                  className="absolute right-1 top-1 flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-[#FE7818] px-0.5 text-[7.5px] font-medium leading-none text-white"
                >
                  {badge}
                </motion.span>
              )}
            </Link>
          </motion.div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.form
            action="/products"
            role="search"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: productEase }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2.5">
              <input
                ref={inputRef}
                name="search"
                placeholder="Search products, brands..."
                aria-label="Search products"
                enterKeyHint="search"
                className="h-10 w-full rounded-full border border-[#E6ECF5] bg-white px-4 text-sm text-[#172033] outline-none placeholder:text-[#8B95A7] focus-visible:ring-2 focus-visible:ring-[#2864E8]"
              />
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </header>
  );
}
