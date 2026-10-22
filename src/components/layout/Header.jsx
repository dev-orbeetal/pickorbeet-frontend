import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Heart, Menu, Search, ShoppingCart, User, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '@/store/slices/authSlice';
import { storeSettingsAPI } from '@/lib/api';
import { getMediaUrl } from '@/lib/siteConfig';
import { useSearch } from '@/hooks';
import { DesktopCategoryNav, MobileCategoryNav } from '@/components/layout/CategoryNav';
import LogoMark from '@/components/brand/LogoMark';
import InlineDots from '@/components/loading/InlineDots';

function SearchSuggestions({ query, results, loading, recentSearches, onPick, onRecent }) {
  const showRecent = query.trim().length < 2 && recentSearches.length > 0;
  const showResults = query.trim().length >= 2;
  if (!showRecent && !showResults) return null;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#E4E9F2] bg-white text-charcoal-900 shadow-elegant-lg">
      {showRecent && (
        <div className="py-1">
          <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">Recent</p>
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onRecent(term)}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#F5F7FC] focus-visible:bg-[#F5F7FC] focus-visible:outline-none"
            >
              {term}
            </button>
          ))}
        </div>
      )}
      {showResults && loading && (
        <p className="flex items-center gap-2 px-3 py-3 text-sm text-gold-600">
          <InlineDots />
          Searching...
        </p>
      )}
      {showResults && !loading && results.length === 0 && (
        <p className="px-3 py-3 text-sm text-charcoal-500">No matching products</p>
      )}
      {showResults && !loading && results.length > 0 && (
        <ul>
          {results.slice(0, 6).map((product) => (
            <li key={product.id}>
              <Link
                href={`/product/${product.slug}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPick(query)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#F5F7FC] focus-visible:bg-[#F5F7FC] focus-visible:outline-none"
              >
                <img
                  src={getMediaUrl(product.primary_image)}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-md bg-[#F5F7FC] object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name}</span>
                  <span className="text-xs font-semibold text-action">৳{Number(product.price).toLocaleString()}</span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onRecent(query.trim())}
              className="block w-full border-t border-[#E4E9F2] px-3 py-2.5 text-left text-sm font-semibold text-action hover:bg-[#F5F7FC]"
            >
              View all results
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [logo, setLogo] = useState('');
  const [searchFocus, setSearchFocus] = useState(null);
  const [desktopSearchLayout, setDesktopSearchLayout] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results,
    isLoading,
    recentSearches,
    handleSubmit: rememberSearch,
  } = useSearch({ debounceDelay: 300, minQueryLength: 2 });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktopSearchLayout(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    storeSettingsAPI.getPublicSettings()
      .then((res) => setLogo(res.data?.logo || ''))
      .catch(() => {});
  }, []);

  const dispatch = useDispatch();
  const router = useRouter();
  const { totalItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.products);
  const categoryList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchFocus(null);
  }, [router.asPath]);

  useEffect(() => {
    const toggle = () => setIsMenuOpen((open) => !open);
    window.addEventListener('pickorbeet:open-menu', toggle);
    return () => window.removeEventListener('pickorbeet:open-menu', toggle);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pickorbeet:menu-state', { detail: isMenuOpen }));
  }, [isMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('You have been logged out successfully');
    setShowUserMenu(false);
    router.push('/');
  };

  const goToSearch = (term) => {
    const query = (term || '').trim();
    setSearchFocus(null);
    setIsMenuOpen(false);
    if (!query) {
      router.push('/products');
      return;
    }
    if (query === searchQuery.trim()) rememberSearch();
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    goToSearch(searchQuery);
  };

  const suggestionProps = {
    query: searchQuery,
    results,
    loading: isLoading,
    recentSearches,
    onPick: (term) => {
      if (term?.trim()) rememberSearch();
      setSearchFocus(null);
      setIsMenuOpen(false);
    },
    onRecent: (term) => {
      setSearchQuery(term);
      goToSearch(term);
    },
  };

  const iconClass = 'relative flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-white/95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-[380px]:w-11 lg:h-auto lg:w-auto lg:flex-col lg:px-2 lg:py-1';

  return (
    <header className="sticky top-0 z-50 bg-navy-800 text-white">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-2 lg:h-[5.5rem] lg:gap-6">
          <Link href="/" aria-label="PickOrbeet" className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <LogoMark
              src={logo || '/images/logo.png'}
              alt=""
              width={56}
              height={36}
              className="h-[calc(2.8rem*0.7)] w-auto shrink-0 overflow-hidden rounded-xl bg-ice md:h-[2.8rem] lg:h-16"
              imgClassName="block h-[112%] w-auto max-w-none -translate-y-[6%]"
            />
          </Link>

          <form
            ref={desktopSearchRef}
            onSubmit={handleSearch}
            role="search"
            className="relative hidden min-w-0 flex-1 items-center md:flex"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchFocus('desktop')}
              onBlur={() => setSearchFocus((current) => (current === 'desktop' ? null : current))}
              placeholder="Search for products, brands and more..."
              aria-label="Search products"
              className="h-11 w-full rounded-l-lg border border-[#D3DDF6] bg-ice pl-10 pr-3 text-sm text-navy-900 outline-none placeholder:text-navy-800/50 focus-visible:ring-2 focus-visible:ring-gold-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-11 w-12 shrink-0 items-center justify-center rounded-r-lg bg-gold-500 text-white transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Search className="h-5 w-5" />
            </button>
            {desktopSearchLayout && (searchFocus === 'desktop' || searchQuery.trim().length >= 2) && <SearchSuggestions {...suggestionProps} />}
          </form>

          <form
            ref={mobileSearchRef}
            onSubmit={handleSearch}
            role="search"
            className="relative flex min-w-0 flex-1 items-center md:hidden"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setSearchFocus('mobile')}
                onBlur={() => setSearchFocus((current) => (current === 'mobile' ? null : current))}
                placeholder="Search products, brands..."
                aria-label="Search products"
                enterKeyHint="search"
                className="h-11 w-full rounded-l-lg border border-[#D3DDF6] bg-ice pl-10 pr-3 text-sm text-navy-900 outline-none placeholder:text-navy-800/50 focus-visible:ring-2 focus-visible:ring-gold-500"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="flex h-11 w-12 shrink-0 items-center justify-center rounded-r-lg bg-gold-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Search className="h-5 w-5" />
            </button>
            {!desktopSearchLayout && (searchFocus === 'mobile' || searchQuery.trim().length >= 2) && <SearchSuggestions {...suggestionProps} />}
          </form>

          <div className="flex shrink-0 items-center">
            <div className="hidden items-center lg:flex">
              <div
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <Link
                  href={isAuthenticated ? '/account' : '/login'}
                  aria-label="Account"
                  className={iconClass}
                >
                  <User className="h-5 w-5" />
                  <span className="mt-0.5 hidden text-[11px] font-medium lg:block">Account</span>
                </Link>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-cream-400 bg-white py-2 text-charcoal-700 shadow-elegant-lg"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="border-b border-cream-400 px-4 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-gold-600">Welcome</p>
                            <p className="font-semibold text-charcoal-900">{user?.first_name || 'Account'}</p>
                          </div>
                          <Link href="/account" className="block px-4 py-2.5 hover:bg-cream-200">My Account</Link>
                          <Link href="/orders" className="block px-4 py-2.5 hover:bg-cream-200">My Orders</Link>
                          <button type="button" onClick={handleLogout} className="w-full px-4 py-2.5 text-left hover:bg-red-50 hover:text-red-600">
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="block px-4 py-2.5 hover:bg-cream-200">Login</Link>
                          <Link href="/register" className="block px-4 py-2.5 hover:bg-cream-200">Register</Link>
                          <Link href="/track-order" className="block px-4 py-2.5 hover:bg-cream-200">Track Order</Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/wishlist" aria-label="Wishlist" className={iconClass}>
                <Heart className="h-5 w-5" />
                <span className="mt-0.5 hidden text-[11px] font-medium lg:block">Wishlist</span>
              </Link>

              <Link href="/cart" aria-label={`Cart${totalItems ? `, ${totalItems} items` : ''}`} className={iconClass}>
                <span className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 hidden text-[11px] font-medium lg:block">Cart</span>
              </Link>
            </div>

            <button
              type="button"
              className={`${iconClass} lg:hidden`}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-category-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-white/10 lg:block">
        <div className="container-custom flex h-12 items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-md border border-white/25 px-3 text-sm font-medium hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Menu className="h-4 w-4" />
              All Categories
              <ChevronDown className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full z-50 mt-2 max-h-96 w-72 overflow-y-auto rounded-xl bg-white py-2 text-charcoal-700 shadow-elegant-lg"
                >
                  {categoryList.length === 0 && (
                    <p className="px-4 py-3 text-sm text-charcoal-500">No categories yet</p>
                  )}
                  {categoryList.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="block px-4 py-2.5 text-sm hover:bg-cream-200 hover:text-navy-800"
                    >
                      {category.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DesktopCategoryNav categories={categoryList} />

          <Link
            href="/products?on_sale=1"
            className="ml-2 flex h-8 shrink-0 items-center rounded-md bg-gold-500 px-4 text-sm font-semibold hover:bg-gold-400"
          >
            Deals
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-category-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <nav className="container-custom flex max-h-[min(70vh,28rem)] flex-col overflow-y-auto py-3">
              <Link href="/products?on_sale=1" onClick={() => setIsMenuOpen(false)} className="py-2.5 font-semibold text-gold-400">
                Deals
              </Link>
              <MobileCategoryNav categories={categoryList} onNavigate={() => setIsMenuOpen(false)} />
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-sm text-white/90">
                All products
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
