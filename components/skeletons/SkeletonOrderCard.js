export default function SkeletonOrderCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        {/* Order ID */}
        <div className="h-5 bg-gray-200 rounded w-32 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
        {/* Status Badge */}
        <div className="h-6 bg-gray-200 rounded-full w-24 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>

      {/* Date */}
      <div className="h-4 bg-gray-200 rounded w-40 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-24 relative overflow-hidden">
          <div className="absolute inset-0 shimmer"></div>
        </div>
      </div>
    </div>
  );
}
