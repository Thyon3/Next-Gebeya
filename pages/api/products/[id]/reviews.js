import { isAuth, isAdmin } from '@/utils/auth';
import db from "@/utils/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }

  if (req.method === "GET") {
    return getReviews(req, res);
  }

  if (req.method === "POST") {
    if (!user) {
      return res.status(401).json({ message: "Sign in required" });
    }
    return createReview(req, res, user);
  }

  return res.status(405).json({ message: "Method not allowed" });
};

// Get all reviews for a product
const getReviews = async (req, res) => {
  try {
    await db.connect();
    
    const { id } = req.query;
    const { sort = "recent", filter = "all" } = req.query;

    // Convert id to ObjectId for proper querying
    const productObjectId = new mongoose.Types.ObjectId(id);

    let sortOption = { createdAt: -1 }; // Default: most recent
    
    if (sort === "helpful") {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    } else if (sort === "rating-high") {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === "rating-low") {
      sortOption = { rating: 1, createdAt: -1 };
    }

    let filterOption = { product: productObjectId, status: "approved" };
    
    if (filter !== "all" && filter >= 1 && filter <= 5) {
      filterOption.rating = parseInt(filter);
    } else if (filter === "verified") {
      filterOption.verifiedPurchase = true;
    }

    const reviews = await Review.find(filterOption)
      .sort(sortOption)
      .lean();

    // Get rating statistics
    const stats = await Review.aggregate([
      { $match: { product: productObjectId, status: "approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingStats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      ratingStats[stat._id] = stat.count;
    });

    const totalReviews = Object.values(ratingStats).reduce((a, b) => a + b, 0);

    res.status(200).json({
      reviews: reviews.map(db.convertDocToObj),
      stats: ratingStats,
      totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new review
const createReview = async (req, res, user) => {
  try {
    await db.connect();

    const { id } = req.query;
    const { rating, title, comment, images = [] } = req.body;

    // Validate input
    if (!rating || !title || !comment) {
      return res.status(400).json({ message: "Please provide rating, title, and comment" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Convert id to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(id);

    // Check if product exists
    const product = await Product.findById(productObjectId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productObjectId,
      user: user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Check if user purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      user: user._id,
      $or: [
        { "orderItems.slug": product.slug },
        { "orderItems.name": product.name }
      ],
      isPaid: true,
      isDelivered: true,
    });

    // Create review
    const review = await Review.create({
      product: productObjectId,
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      rating,
      title,
      comment,
      images,
      verifiedPurchase: !!hasPurchased,
      status: "approved", // Auto-approve
    });

    // Update product rating (including the new review)
    const allReviews = await Review.find({ product: productObjectId, status: "approved" });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    product.rating = avgRating;
    product.numReviews = allReviews.length;
    product.totalRatings = allReviews.length;
    
    // Also update the ratings array if it exists
    if (!product.ratings) {
      product.ratings = [];
    }
    product.ratings.push(rating);
    
    await product.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review: db.convertDocToObj(review),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
