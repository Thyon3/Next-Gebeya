import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Please provide a product slug"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide a product image"],
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    brand: {
      type: String,
      required: [true, "Please provide a brand"],
      trim: true,
    },
    brandLogo: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    ratings: [
      {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5,
      },
    ],
    totalRatings: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Total ratings cannot be negative"],
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
    reviews: [
      {
        type: String,
        required: true,
      },
    ],
    soldCount: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
    },
    countInStock: {
      type: Number,
      required: [true, "Please provide stock count"],
      default: 0,
      min: [0, "Stock count cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    banner: {
      type: String,
      default: "",
    },
    // Hero Section Enhancement Fields
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    flashSalePrice: {
      type: Number,
      default: null,
      min: [0, "Flash sale price cannot be negative"],
    },
    flashSaleEndDate: {
      type: Date,
      default: null,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
