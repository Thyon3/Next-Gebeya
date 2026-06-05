export default function SkeletonCartItem() {
  return (
    <div className="flex items-center space-x-4 border-b pb-4 mb-4 animate-pulse">
      {/* Image */}
      <div className="w-24 h-24 bg-gray-200 rounded relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 shimmer"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-300"
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

      {/* Details */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-1/4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gray-200 rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
      </div>
    </div>
  );
}
