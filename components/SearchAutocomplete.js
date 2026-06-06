import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

export default function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapperRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const saveRecentSearch = (searchQuery) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?query=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      saveRecentSearch(suggestion.name);
      router.push(`/product/${suggestion.slug}`);
    } else if (suggestion.type === 'category') {
      router.push(`/search?category=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'brand') {
      router.push(`/search?brand=${encodeURIComponent(suggestion.name)}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search);
    router.push(`/search?query=${encodeURIComponent(search)}`);
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="absolute left-5 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600/20 focus:bg-white dark:focus:bg-gray-700/50 rounded-2xl py-3 pl-14 pr-32 text-[15px] font-medium focus:ring-4 focus:ring-blue-600/10 dark:text-white transition-all placeholder:text-gray-400 shadow-inner"
          placeholder="I'm shopping for..."
        />
        <button
          type="submit"
          className="absolute right-2 bg-gray-900 text-white p-2 rounded-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 max-h-[600px] overflow-y-auto z-50 animate-fadeIn overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="p-10 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600/20 border-t-blue-600"></div>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex justify-between items-center px-2 py-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-2 pb-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-xl transition-all border border-gray-100 dark:border-gray-600 shadow-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {query && suggestions.length > 0 && !loading && (
            <div className="p-3">
              {/* Products */}
              {suggestions.filter(s => s.type === 'product').length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-3">Matching Products</h3>
                  <div className="space-y-1">
                    {suggestions.filter(s => s.type === 'product').map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl flex items-center gap-4 group transition-all"
                      >
                        {product.image && (
                          <div className="w-14 h-14 relative flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 truncate transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{product.brand}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[15px] font-black text-gray-900 dark:text-gray-100">${product.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories & Brands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 dark:border-gray-700 mt-2 pt-2">
                {/* Categories */}
                {suggestions.filter(s => s.type === 'category').length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-3">Categories</h3>
                    <div className="space-y-1">
                      {suggestions.filter(s => s.type === 'category').map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(category)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl flex items-center gap-3 group transition-all"
                        >
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-400 group-hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {suggestions.filter(s => s.type === 'brand').length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-3">Brands</h3>
                    <div className="space-y-1">
                      {suggestions.filter(s => s.type === 'brand').map((brand, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(brand)}
                          className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-3 group transition-all"
                        >
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">{brand.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !loading && (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">No results found</p>
              <p className="text-sm font-medium text-gray-500 mt-2 max-w-xs mx-auto">We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.</p>
              <button onClick={() => setQuery('')} className="mt-8 text-sm font-black text-blue-600 uppercase tracking-widest hover:underline">View All Categories</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
