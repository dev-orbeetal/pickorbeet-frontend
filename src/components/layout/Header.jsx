import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, User, Menu, X, Search, Heart, ChevronDown 
} from 'lucide-react';
import { fetchCategories } from '@/store/slices/productsSlice';
import { checkAuth, logout } from '@/store/slices/authSlice';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-display font-bold text-primary-600">
              Zzuhana
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
            >
              Home
            </Link>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                Categories
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border py-2"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link 
              href="/products" 
              className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
            >
              Shop
            </Link>
            
            <Link 
              href="/about" 
              className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
            >
              About
            </Link>
            
            <Link 
              href="/contact" 
              className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-secondary-600 hover:text-primary-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <Link 
              href="/cart" 
              className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button className="p-2 text-secondary-600 hover:text-primary-600 transition-colors">
                <User className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border py-2"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm text-secondary-500">Welcome,</p>
                          <p className="font-medium text-secondary-900">{user?.first_name}</p>
                        </div>
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          Register
                        </Link>
                        <Link
                          href="/track-order"
                          className="block px-4 py-2 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          Track Order
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-secondary-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t pt-4"
            >
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-secondary-700 font-medium">Home</Link>
                <Link href="/products" className="text-secondary-700 font-medium">Shop</Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="text-secondary-600 pl-4"
                  >
                    {category.name}
                  </Link>
                ))}
                <Link href="/about" className="text-secondary-700 font-medium">About</Link>
                <Link href="/contact" className="text-secondary-700 font-medium">Contact</Link>
                <Link href="/track-order" className="text-secondary-700 font-medium">Track Order</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
