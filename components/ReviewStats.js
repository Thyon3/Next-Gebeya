import ReactStars from "react-rating-stars-component";

export default function ReviewStats({ stats, totalReviews, averageRating }) {
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const ratingBars = [5, 4, 3, 2, 1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>

      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-6 pb-6 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <ReactStars
            count={5}
            value={averageRating}
            size={24}
            activeColor="#ffd700"
            edit={false}
          />
          <p className="text-sm text-gray-600 mt-2">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1">
          {ratingBars.map((rating) => {
            const count = stats[rating] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-yellow-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Distribution */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {getPercentage(stats[5] + stats[4])}%
          </div>
          <p className="text-xs text-gray-600">Positive</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {getPercentage(stats[3])}%
          </div>
          <p className="text-xs text-gray-600">Neutral</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {getPercentage(stats[2] + stats[1])}%
          </div>
          <p className="text-xs text-gray-600">Negative</p>
        </div>
      </div>
    </div>
  );
}
