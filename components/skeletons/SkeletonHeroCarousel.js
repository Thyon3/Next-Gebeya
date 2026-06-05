export default function SkeletonHeroCarousel() {
  return (
    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="absolute inset-0 shimmer"></div>
      
      {/* Icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-24 h-24 text-gray-300"
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

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
        ))}
      </div>
    </div>
  );
}
