import { useState, useEffect } from "react";
import axios from "axios";
import ReviewStats from "./ReviewStats";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/products/${productId}/reviews?sort=${sortBy}&filter=${filterBy}`
      );
      
      setReviews(data.reviews);
      setStats(data.stats);
      setTotalReviews(data.totalReviews);
      
      // Calculate average rating
      const total = Object.entries(data.stats).reduce(
        (sum, [rating, count]) => sum + parseInt(rating) * count,
        0
      );
      const avg = data.totalReviews > 0 ? total / data.totalReviews : 0;
      setAverageRating(avg);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterBy]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    fetchReviews();
    // Reload the page to update product stats
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div id="reviews" className="mt-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Reviews & Ratings</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {/* Stats */}
      <div className="mb-8">
        <ReviewStats
          stats={stats}
          totalReviews={totalReviews}
          averageRating={averageRating}
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reviews</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
            <option value="verified">Verified Purchases</option>
          </select>
        </div>

        {/* Review Count */}
        <div className="ml-auto text-sm text-gray-600">
          Showing {reviews.length} of {totalReviews} reviews
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading reviews...</p>
        </div>
      ) : (
        <ReviewList reviews={reviews} onReviewUpdate={fetchReviews} />
      )}
    </div>
  );
}
