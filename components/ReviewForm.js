import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_upload_preset"); // You'll need to set this up

        // For now, we'll use a placeholder. In production, integrate with Cloudinary
        // const response = await axios.post(
        //   `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
        //   formData
        // );
        // return response.data.secure_url;

        // Placeholder - return a data URL for demo
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a review title");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your review");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`/api/products/${productId}/reviews`, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      });

      toast.success("Review submitted successfully!");
      
      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">Please sign in to write a review</p>
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`w-10 h-10 ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 fill-current'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              You selected {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience in one line"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={2000}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/2000 characters</p>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Add Photos (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Help others by sharing photos of your experience (Max 5 images)
          </p>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8 mx-auto mb-2 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
