export default function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* Image skeleton */}
      <div className="relative bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-72 overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-20 h-20 text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Brand Badge & Stock Badge */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 min-h-[3.5rem]">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Button */}
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>
    </div>
  );
}
