import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories/public');
        const data = await response.json();
        
        if (data.success && data.categories) {
          const formattedCategories = data.categories.map((cat) => ({
            name: cat.name,
            slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
            count: cat.productCount,
            icon: cat.icon || '📦',
            gradient: cat.gradient || 'from-blue-500 to-cyan-500',
            bgColor: cat.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
            description: cat.description || '',
          }));
          
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Mega Menu Trigger */}
      <button
        onMouseEnter={handleMouseEnter}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>All Categories</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 top-full mt-2 w-screen max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn"
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Browse All Categories
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm font-medium">No categories found</p>
                <p className="text-xs mt-1">Add products to see categories here</p>
              </div>
            ) : (
              <>
                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/search?category=${encodeURIComponent(category.name)}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                      style={{
                        background: category.bgColor?.includes('dark:') 
                          ? undefined 
                          : category.bgColor?.replace('bg-', '').replace('-50', '-50')
                      }}
                    >
                      <div 
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-2 text-2xl shadow-md group-hover:scale-110 transition-transform duration-200`}
                      >
                        {category.icon}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {category.count} {category.count === 1 ? 'item' : 'items'}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <Link
                      href="/search?sortBy=newest"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      New Arrivals
                    </Link>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Link
                      href="/search?sortBy=popular"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Trending
                    </Link>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Link
                      href="/search"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                    >
                      View All Products
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
