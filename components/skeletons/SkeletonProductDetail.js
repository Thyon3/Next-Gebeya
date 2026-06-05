export default function SkeletonProductDetail() {
  return (
    <div className="grid md:grid-cols-2 gap-8 animate-pulse">
      {/* Image Section */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-gray-200 h-96 rounded-lg overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-32 h-32 text-gray-300"
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

        {/* Thumbnail Images */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative bg-gray-200 h-20 rounded overflow-hidden"
            >
              <div className="absolute inset-0 shimmer"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="h-4 bg-gray-200 rounded w-1/4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-4">
          <div className="h-5 bg-gray-200 rounded w-32 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Price */}
        <div className="h-10 bg-gray-200 rounded w-1/3 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Stock Status */}
        <div className="h-6 bg-gray-200 rounded w-1/4 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex space-x-4">
          <div className="h-12 bg-gray-200 rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded flex-1 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded flex-1 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded flex-1 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
