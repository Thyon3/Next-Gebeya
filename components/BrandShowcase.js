import Link from 'next/link';
import { useState } from 'react';

export default function BrandShowcase({ brands = [], settings = {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const brandsPerPage = settings.brandShowcasePerPage || 10; // Show more for higher density

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
    <div className="mb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            {settings.brandShowcaseHeading || 'Featured Brands'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {settings.brandShowcaseDescription || 'Top-tier official partners and trusted manufacturers.'}
          </p>
        </div>

        <Link
          href="/search?sortBy=brand"
          className="group flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          {settings.brandShowcaseViewAllText || 'Explore All Brands'}
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
      </div>

      <div className="relative group">
        {/* Navigation Buttons - Hidden by default, show on section hover */}
        {totalPages > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevSlide}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            >
              <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            >
              <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}

        {/* Brand Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/search?brand=${encodeURIComponent(brand.name)}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 h-36 flex flex-col items-center justify-center transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
                {/* Logo Container */}
                <div className="h-12 w-full flex items-center justify-center mb-3">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-full max-w-[80%] object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 scale-95 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl font-black text-gray-300 dark:text-gray-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Brand Info */}
                <div className="text-center overflow-hidden w-full">
                  <h3 className="font-black text-xs text-gray-900 dark:text-white truncate uppercase tracking-tighter transition-colors group-hover:text-blue-600">
                    {brand.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                      {brand.productCount} Items
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Minimalist Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1 max-w-[100px]"></div>
            <div className="flex gap-2.5">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-500 rounded-full ${index === currentIndex
                    ? 'w-10 h-1.5 bg-gray-900 dark:bg-white'
                    : 'w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1 max-w-[100px]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
