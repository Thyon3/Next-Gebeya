import { isAuth, isAdmin } from '@/utils/auth';
import db from "@/utils/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }

  if (!user || !user.isAdmin) {
    return res.status(401).json({ message: "Admin access required" });
  }

  if (req.method === "PUT") {
    return updateStatus(req, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
};

const updateStatus = async (req, res) => {
  try {
    await db.connect();

    const { reviewId } = req.query;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // Recalculate product rating if status changed to/from approved
    if (
      (oldStatus === "approved" && status !== "approved") ||
      (oldStatus !== "approved" && status === "approved")
    ) {
      const approvedReviews = await Review.find({
        product: review.product,
        status: "approved",
      });

      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce(
          (sum, r) => sum + r.rating,
          0
        );
        const avgRating = totalRating / approvedReviews.length;

        await Product.findByIdAndUpdate(review.product, {
          rating: avgRating,
          numReviews: approvedReviews.length,
          totalRatings: approvedReviews.length,
        });
      } else {
        await Product.findByIdAndUpdate(review.product, {
          rating: 0,
          numReviews: 0,
          totalRatings: 0,
        });
      }
    }

    res.status(200).json({
      message: `Review ${status} successfully`,
      review: db.convertDocToObj(review),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
