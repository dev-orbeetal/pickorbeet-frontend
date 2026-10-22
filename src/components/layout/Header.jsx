import { useEffect, useState } from 'react';
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
import { DesktopCategoryNav, MobileCategoryNav } from '@/components/layout/CategoryNav';

function Wordmark() {
  return (
    <span className="text-[22px] font-extrabold tracking-tight leading-none">
      <span className="text-white">Pick</span>
      <span className="text-gold-500">Orbeet</span>
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logo, setLogo] = useState('');

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

  const handleLogout = () => {
    dispatch(logout());
    toast.success('You have been logged out successfully');
    setShowUserMenu(false);
    router.push('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      router.push('/products');
      return;
    }
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white">
      <div className="container-custom">
        <div className="flex items-center gap-3 lg:gap-6 h-[72px]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo || '/images/logo.png'} alt="" className="h-11 w-auto" />
            <Wordmark />
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center min-w-0">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full h-11 px-4 rounded-l-md bg-white text-charcoal-800 placeholder:text-charcoal-400 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="h-11 w-12 shrink-0 rounded-r-md bg-gold-500 hover:bg-gold-400 text-white flex items-center justify-center transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <div
              className="relative"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <Link
                href={isAuthenticated ? '/account' : '/login'}
                className="flex flex-col items-center justify-center px-2 py-1 text-white/90 hover:text-white"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:block text-[11px] mt-0.5 font-medium">Account</span>
              </Link>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full right-0 mt-2 w-52 bg-white text-charcoal-700 rounded-xl shadow-elegant-lg border border-cream-400 py-2 overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-cream-400">
                          <p className="text-[11px] uppercase tracking-wider text-gold-600">Welcome</p>
                          <p className="font-semibold text-charcoal-900">{user?.first_name || 'Account'}</p>
                        </div>
                        <Link href="/account" className="block px-4 py-2.5 hover:bg-cream-200">My Account</Link>
                        <Link href="/orders" className="block px-4 py-2.5 hover:bg-cream-200">My Orders</Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-600">
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

            <button
              type="button"
              aria-label="Wishlist"
              className="flex flex-col items-center justify-center px-2 py-1 text-white/90 hover:text-white"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:block text-[11px] mt-0.5 font-medium">Wishlist</span>
            </button>

            <Link href="/cart" className="relative flex flex-col items-center justify-center px-2 py-1 text-white/90 hover:text-white">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:block text-[11px] mt-0.5 font-medium">Cart</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute -top-0.5 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              type="button"
              className="lg:hidden p-2"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden flex pb-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search for products, brands and more..."
            className="w-full h-10 px-3 rounded-l-md bg-white text-charcoal-800 placeholder:text-charcoal-400 text-sm outline-none"
          />
          <button type="submit" aria-label="Search" className="h-10 w-11 rounded-r-md bg-gold-500 text-white flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="hidden lg:block border-t border-white/10">
        <div className="container-custom flex items-center gap-1 h-12">
          <div
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button
              type="button"
              className="flex items-center gap-2 h-9 px-3 rounded-md border border-white/25 text-sm font-medium hover:bg-white/10"
            >
              <Menu className="w-4 h-4" />
              All Categories
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white text-charcoal-700 rounded-xl shadow-elegant-lg py-2"
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
            className="shrink-0 ml-2 h-8 px-4 rounded-md bg-gold-500 hover:bg-gold-400 text-sm font-semibold flex items-center"
          >
            Deals
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/10"
          >
            <nav className="container-custom py-3 flex flex-col">
              <Link href="/products?on_sale=1" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-gold-400 font-semibold">
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
