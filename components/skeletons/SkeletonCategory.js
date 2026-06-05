export default function SkeletonCategory() {
  return (
    <div className="card overflow-hidden animate-pulse">
      {/* Image */}
      <div className="relative bg-gray-200 h-48 overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>
    </div>
  );
}
