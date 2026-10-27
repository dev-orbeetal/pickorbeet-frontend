import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Heart, Search, ShoppingCart } from 'lucide-react';
import { productEase } from '@/components/product/motion';

const iconButton = 'flex h-9 w-9 items-center justify-center rounded-full border border-[#E6ECF5] bg-white text-[#172033] shadow-[0_1px_4px_rgba(23,32,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]';

export default function ProductMobileBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const { totalItems } = useSelector((state) => state.cart);
  const [searchOpen, setSearchOpen] = useState(false);
  const badge = totalItems > 99 ? '99+' : String(totalItems);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const back = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-[#F6F9FE]/95 backdrop-blur-md lg:hidden">
      <div className="container-custom flex h-[52px] items-center">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="-ml-1 flex h-10 w-8 items-center justify-center text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <Link
          href="/"
          aria-label="PickOrbeet"
          className="flex min-w-0 items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
        >
          <img src="/images/logo.png" alt="" width={28} height={33} className="h-8 w-7 object-contain" />
          <span className="truncate text-[17px] font-extrabold leading-none tracking-[-0.04em] text-[#0C49D8]">
            Pick<span className="text-[#FF7A1A]">Orbeet</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <motion.button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            className={iconButton}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </motion.button>
          <motion.div whileTap={reduce ? undefined : { scale: 0.92 }}>
            <Link href="/wishlist" aria-label="Wishlist" className={iconButton}>
              <Heart className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
          </motion.div>
          <motion.div whileTap={reduce ? undefined : { scale: 0.92 }}>
            <Link
              href="/cart"
              aria-label={totalItems ? `Cart, ${totalItems} items` : 'Cart'}
              className={`${iconButton} relative`}
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.2} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF7A1A] px-1 text-[9px] font-bold leading-none text-white">
                  {badge}
                </span>
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
            <div className="container-custom pb-2.5">
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
