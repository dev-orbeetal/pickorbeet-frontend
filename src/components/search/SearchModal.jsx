import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearch, useEscapeKey, useClickOutside } from '@/hooks';
import { storeSettingsAPI } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15 }
  },
};

const resultVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
};

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [popularSearches, setPopularSearches] = useState(['Borkha', 'Hijab', 'Abaya', 'Niqab']);
  const {
    query,
    setQuery,
    results,
    isLoading,
    recentSearches,
    clearRecentSearches,
    clearSearch,
    handleSubmit,
  } = useSearch({ debounceDelay: 300, minQueryLength: 2 });

  // Fetch popular searches from store settings
  useEffect(() => {
    storeSettingsAPI.getPublicSettings()
      .then((res) => {
        const terms = res.data?.popular_searches;
        if (terms) {
          setPopularSearches(terms.split(',').map((s) => s.trim()).filter(Boolean));
        }
      })
      .catch(() => { });
  }, []);

  const modalRef = useClickOutside(() => {
    if (isOpen) onClose();
  });

  // Handle escape key
  useEscapeKey(() => {
    if (isOpen) onClose();
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const handleResultClick = (slug) => {
    handleSubmit();
    onClose();
    router.push(`/product/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSubmit();
      onClose();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
  };

  const getImageUrl = (url) => {
    if (!url) return '/images/placeholder-product.png';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] bg-charcoal-900/60 backdrop-blur-sm"
        >
          <div className="min-h-screen px-4 pt-16 md:pt-24">
            <motion.div
              ref={modalRef}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-charcoal-200"
            >
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex items-center border-b border-charcoal-200">
                  <div className="pl-5">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 text-charcoal-400" />
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-5 text-lg text-charcoal-800 placeholder-charcoal-400 focus:outline-none bg-transparent"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 mr-2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-3 mr-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-all"
                  >
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-charcoal-500 bg-charcoal-100 rounded">
                      ESC
                    </kbd>
                    <X className="w-5 h-5 md:hidden" />
                  </button>
                </div>
              </form>

              {/* Search Results or Recent Searches */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Loading State */}
                {isLoading && query.length >= 2 && (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
                    <p className="text-charcoal-500">Searching...</p>
                  </div>
                )}

                {/* Results */}
                {!isLoading && results.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3 px-2">
                      Products ({results.length})
                    </p>
                    <div className="space-y-1">
                      {results.slice(0, 8).map((product, index) => (
                        <motion.button
                          key={product.id}
                          custom={index}
                          variants={resultVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gold-50 transition-all duration-200 group text-left"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                            <img
                              src={getImageUrl(product.primary_image)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/images/placeholder-product.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-charcoal-800 truncate group-hover:text-gold-700 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gold-600 font-semibold">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_price && product.compare_price > product.price && (
                                <span className="text-sm text-charcoal-400 line-through">
                                  {formatPrice(product.compare_price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-charcoal-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>

                    {results.length > 8 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-3 py-3 text-center text-gold-600 hover:text-gold-700 font-medium hover:bg-gold-50 rounded-xl transition-all"
                      >
                        View all {results.length} results
                      </button>
                    )}
                  </div>
                )}

                {/* No Results */}
                {!isLoading && query.length >= 2 && results.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-charcoal-400" />
                    </div>
                    <h3 className="text-lg font-medium text-charcoal-800 mb-2">
                      No results found
                    </h3>
                    <p className="text-charcoal-500">
                      Try different keywords or browse our categories
                    </p>
                  </div>
                )}

                {/* Recent Searches (when no query) */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3 px-2">
                      <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </p>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((searchTerm, index) => (
                        <motion.button
                          key={index}
                          custom={index}
                          variants={resultVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => handleRecentSearchClick(searchTerm)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gold-50 transition-all duration-200 group text-left"
                        >
                          <Clock className="w-4 h-4 text-charcoal-400" />
                          <span className="text-charcoal-700 group-hover:text-gold-700 transition-colors">
                            {searchTerm}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links (when no query and no recent searches) */}
                {!query && recentSearches.length === 0 && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Popular Categories
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {popularSearches.map((term) => (
                        <Link
                          key={term}
                          href={`/products?search=${encodeURIComponent(term)}`}
                          onClick={onClose}
                          className="px-4 py-2 bg-cream-100 hover:bg-gold-100 text-charcoal-700 hover:text-gold-700 rounded-full text-sm font-medium transition-all"
                        >
                          {term}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-charcoal-200 px-5 py-3 bg-cream-50">
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded">Enter</kbd> to search</span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded ml-1">↓</kbd>
                    to navigate
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
