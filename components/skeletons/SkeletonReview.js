export default function SkeletonReview() {
  return (
    <div className="border-b pb-4 mb-4 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-200 rounded-full relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 shimmer"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {/* Name and Rating */}
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-32 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
          </div>

          {/* Date */}
          <div className="h-3 bg-gray-200 rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-200 rounded w-20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
