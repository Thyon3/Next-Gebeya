import { useState } from "react";
import { useSession } from "next-auth/react";
import ReactStars from "react-rating-stars-component";
import Image from "next/image";
import { toast } from "react-toastify";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function ReviewList({ reviews, onReviewUpdate }) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleHelpful = async (reviewId) => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const { data } = await axios.post(`/api/reviews/${reviewId}/helpful`);
      toast.success(data.message);
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to vote");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
        <p className="text-gray-600 text-lg">No reviews yet</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                    {review.verifiedPurchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Delete button for own reviews */}
              {session?.user?._id === review.user && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="mb-3">
              <ReactStars
                count={5}
                value={review.rating}
                size={20}
                activeColor="#ffd700"
                edit={false}
              />
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg mb-2">{review.title}</h3>

            {/* Comment */}
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {review.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <button
                onClick={() => handleHelpful(review._id)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Helpful ({review.helpfulCount})
                </span>
              </button>
            </div>

            {/* Admin Response */}
            {review.adminResponse && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="font-semibold text-blue-900 mb-1">Response from Store</p>
                <p className="text-gray-700 text-sm">{review.adminResponse.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(review.adminResponse.date), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={selectedImage}
              alt="Review image"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
