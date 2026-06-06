import { isAuth, isAdmin } from '@/utils/auth';
import db from "@/utils/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }

  if (req.method === "PUT") {
    if (!user) {
      return res.status(401).json({ message: "Sign in required" });
    }
    return updateReview(req, res, user);
  }

  if (req.method === "DELETE") {
    if (!user) {
      return res.status(401).json({ message: "Sign in required" });
    }
    return deleteReview(req, res, user);
  }

  return res.status(405).json({ message: "Method not allowed" });
};

// Update review (edit)
const updateReview = async (req, res, user) => {
  try {
    await db.connect();

    const { reviewId } = req.query;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review
    if (review.user.toString() !== user._id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({
      product: review.product,
      status: "approved",
    });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating,
      numReviews: allReviews.length,
      totalRatings: allReviews.length,
    });

    res.status(200).json({
      message: "Review updated successfully",
      review: db.convertDocToObj(review),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review
const deleteReview = async (req, res, user) => {
  try {
    await db.connect();

    const { reviewId } = req.query;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== user._id && !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    const allReviews = await Review.find({
      product: productId,
      status: "approved",
    });

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: allReviews.length,
        totalRatings: allReviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
        totalRatings: 0,
      });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
