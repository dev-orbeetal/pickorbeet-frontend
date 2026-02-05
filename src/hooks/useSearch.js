import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { productsAPI } from '@/lib/api';

/**
 * Custom hook for product search with debouncing and caching
 * @param {Object} options - Search options
 * @param {number} options.debounceDelay - Debounce delay in ms (default: 300)
 * @param {number} options.minQueryLength - Minimum query length to trigger search (default: 2)
 * @returns {Object} - Search state and handlers
 */
export function useSearch({ debounceDelay = 300, minQueryLength = 2 } = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const debouncedQuery = useDebounce(query, debounceDelay);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing recent searches:', e);
        }
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());
      const updated = [searchQuery, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await productsAPI.getProducts({ search: searchQuery });
      const data = response.data;
      setResults(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [minQueryLength]);

  // Effect to trigger search on debounced query change
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Handle query change
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  // Handle search submit (saves to recent)
  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
  }, [query, saveRecentSearch]);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    isLoading,
    error,
    recentSearches,
    clearRecentSearches,
    clearSearch,
    handleSubmit,
    debouncedQuery,
  };
}

export default useSearch;
