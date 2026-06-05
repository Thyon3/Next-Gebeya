export default function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="card p-5 animate-pulse">
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
          </div>

          {/* Value */}
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-2 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>

          {/* Label */}
          <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
