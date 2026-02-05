import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, User, Menu, X, Search, ChevronDown, Heart
} from 'lucide-react';
import SearchModal from '@/components/search/SearchModal';
import { fetchCategories } from '@/store/slices/productsSlice';
import { checkAuth, logout } from '@/store/slices/authSlice';

const navLinkVariants = {
  hover: { y: -2 },
  tap: { scale: 0.98 }
};

const dropdownVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 }
    }
  }
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { totalItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(checkAuth());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const NavLink = ({ href, children }) => (
    <motion.div
      variants={navLinkVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <Link
        href={href}
        className="relative text-charcoal-700 hover:text-gold-600 transition-colors duration-300 font-medium group"
      >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300 group-hover:w-full rounded-full" />
      </Link>
    </motion.div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-luxury ${isScrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-elegant py-1 border-b border-charcoal-200'
        : 'bg-white/90 backdrop-blur-md py-2'
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src="/images/logo.png"
                alt="Zzuhana"
                className="h-12 md:h-14 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <NavLink href="/">Home</NavLink>

            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <motion.button
                variants={navLinkVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex items-center text-charcoal-700 hover:text-gold-600 transition-colors duration-300 font-medium group"
              >
                Categories
                <motion.span
                  animate={{ rotate: showCategories ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 ml-1" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white backdrop-blur-xl rounded-2xl shadow-elegant-lg border border-charcoal-200 py-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none" />
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex items-center px-5 py-3 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200 group"
                        >
                          <span className="w-2 h-2 rounded-full bg-gold-400 group-hover:bg-gold-500 mr-3 transition-colors duration-200" />
                          <span className="font-medium">{category.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/products">Shop</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all duration-300"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="relative p-2.5 text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all duration-300 block"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence mode="wait">
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-gold-500 to-gold-400 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg shadow-gold-500/30"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            <div
              className="relative"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all duration-300"
              >
                <User className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full right-0 mt-4 w-56 bg-white backdrop-blur-xl rounded-2xl shadow-elegant-lg border border-charcoal-200 py-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none" />
                    {isAuthenticated ? (
                      <>
                        <div className="px-5 py-3 border-b border-charcoal-100">
                          <p className="text-xs text-gold-600 uppercase tracking-wider">Welcome back</p>
                          <p className="font-semibold text-charcoal-800 mt-0.5">{user?.first_name}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/account"
                            className="flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200"
                          >
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200"
                          >
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link
                          href="/login"
                          className="flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200"
                        >
                          Register
                        </Link>
                        <div className="mx-4 my-2 h-px bg-charcoal-200" />
                        <Link
                          href="/track-order"
                          className="flex items-center px-5 py-2.5 text-charcoal-600 hover:bg-gold-50 hover:text-gold-700 transition-all duration-200"
                        >
                          Track Order
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2.5 text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden mt-4 overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-charcoal-200 p-6 shadow-elegant-lg">
                <nav className="flex flex-col space-y-1">
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/products', label: 'Shop' },
                    { href: '/about', label: 'About' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/track-order', label: 'Track Order' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="block py-3 px-4 text-charcoal-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  {categories.length > 0 && (
                    <>
                      <div className="py-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-charcoal-300 to-transparent" />
                      </div>
                      <p className="px-4 py-2 text-xs font-semibold text-gold-600 uppercase tracking-wider">Categories</p>
                      {categories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + 5) * 0.05 }}
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            className="block py-2.5 px-4 pl-8 text-charcoal-600 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
