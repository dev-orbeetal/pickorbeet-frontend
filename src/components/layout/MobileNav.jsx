import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Grid2x2, Heart, Home, ShoppingCart, User } from 'lucide-react';

const itemClass = 'relative flex h-16 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-[11px] font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action';

export default function MobileNav() {
  const router = useRouter();
  const { totalItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const path = router.pathname;

  useEffect(() => {
    const onState = (event) => setMenuOpen(Boolean(event.detail));
    window.addEventListener('pickorbeet:menu-state', onState);
    return () => window.removeEventListener('pickorbeet:menu-state', onState);
  }, []);

  const homeActive = path === '/' && !menuOpen;
  const categoriesActive = menuOpen || path.startsWith('/category');
  const wishlistActive = path === '/wishlist';
  const accountActive = path === '/account' || path.startsWith('/profile');
  const cartActive = path === '/cart';

  const tone = (active) => (active ? 'text-action' : 'text-charcoal-500');

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E9F2] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(23,32,51,0.04)] lg:hidden"
    >
      <div className="grid grid-cols-5">
        <Link href="/" className={`${itemClass} ${tone(homeActive)}`} aria-current={homeActive ? 'page' : undefined}>
          <Home className="h-5 w-5" strokeWidth={homeActive ? 2.4 : 2} />
          Home
        </Link>
        <button
          type="button"
          className={`${itemClass} ${tone(categoriesActive)}`}
          aria-expanded={menuOpen}
          aria-controls="mobile-category-menu"
          onClick={() => window.dispatchEvent(new CustomEvent('pickorbeet:open-menu'))}
        >
          <Grid2x2 className="h-5 w-5" strokeWidth={categoriesActive ? 2.4 : 2} />
          Categories
        </button>
        <Link href="/wishlist" className={`${itemClass} ${tone(wishlistActive)}`} aria-current={wishlistActive ? 'page' : undefined}>
          <Heart className="h-5 w-5" strokeWidth={wishlistActive ? 2.4 : 2} />
          Wishlist
        </Link>
        <Link
          href={isAuthenticated ? '/account' : '/login'}
          className={`${itemClass} ${tone(accountActive)}`}
          aria-current={accountActive ? 'page' : undefined}
        >
          <User className="h-5 w-5" strokeWidth={accountActive ? 2.4 : 2} />
          Account
        </Link>
        <Link href="/cart" className={`${itemClass} ${tone(cartActive)}`} aria-current={cartActive ? 'page' : undefined}>
          <span className="relative">
            <ShoppingCart className="h-5 w-5" strokeWidth={cartActive ? 2.4 : 2} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </span>
          Cart
        </Link>
      </div>
    </nav>
  );
}
