import Link from 'next/link';
import { useState } from 'react';

export default function BrandShowcase({ brands = [], settings = {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const brandsPerPage = settings.brandShowcasePerPage || 6;

  if (!brands || brands.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(brands.length / brandsPerPage);
  const displayedBrands = brands.slice(
    currentIndex * brandsPerPage,
    (currentIndex + 1) * brandsPerPage
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="mb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {settings.brandShowcaseHeading || 'Shop by Brand'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {settings.brandShowcaseDescription || 'Discover products from your favorite brands'}
          </p>
        </div>
        <Link
          href="/search?sortBy=brand"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
        >
          {settings.brandShowcaseViewAllText || 'View All Brands'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
              aria-label="Previous brands"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
              aria-label="Next brands"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayedBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/search?brand=${encodeURIComponent(brand.name)}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center min-h-[140px] border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500">
                {/* Logo (if available) */}
                {brand.logo && (
                  <div className="mb-3 flex-shrink-0 h-10 flex items-center justify-center w-full">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="max-w-[80px] max-h-10 object-contain"
                      loading="lazy"
                      onError={(e) => {
                        // Hide broken image and show only text
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Brand Name (always shown) */}
                <div className="text-center flex-grow flex flex-col justify-center">
                  <h3 className="font-bold text-base text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-blue-600 dark:bg-blue-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Featured Brands Badge */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
            />
          </svg>
          {settings.brandShowcaseBadge1 || 'Trusted Brands'}
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          {settings.brandShowcaseBadge2 || 'Authentic Products'}
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          {settings.brandShowcaseBadge3 || 'Official Partners'}
        </div>
      </div>
    </div>
  );
}
