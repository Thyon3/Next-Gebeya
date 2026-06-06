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
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="rounded-tr-none rounded-br-none p-1.5 text-sm focus:ring-0 w-full"
          placeholder="Search products, brands, categories..."
        />
        <button
          className="rounded rounded-tl-none rounded-bl-none bg-blue-400 p-1 text-sm dark:text-black hover:bg-blue-500 transition-colors"
          type="submit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex justify-between items-center px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 group-hover:text-blue-600">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {query && suggestions.length > 0 && !loading && (
            <div className="p-2">
              {/* Products */}
              {suggestions.filter(s => s.type === 'product').length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Products</h3>
                  {suggestions.filter(s => s.type === 'product').map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3 group"
                    >
                      {product.image && (
                        <div className="w-10 h-10 relative flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${product.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions.filter(s => s.type === 'category').length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Categories</h3>
                  {suggestions.filter(s => s.type === 'category').map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(category)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2 group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h.008v.008H6V6z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 group-hover:text-blue-600">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {category.count} items
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Brands */}
              {suggestions.filter(s => s.type === 'brand').length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Brands</h3>
                  {suggestions.filter(s => s.type === 'brand').map((brand, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(brand)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2 group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h.008v.008H6V6z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 group-hover:text-blue-600">
                        {brand.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {brand.count} products
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !loading && (
            <div className="p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-12 h-12 mx-auto text-gray-300 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
