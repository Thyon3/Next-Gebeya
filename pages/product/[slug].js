import Layout from "@/components/Layout";
import Product from "@/models/Product";
import db from "@/utils/db";
import { getError } from "@/utils/error";
import { Store } from "@/utils/Store";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { toast } from "react-toastify";
import ReviewsSection from "@/components/ReviewsSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import { addToRecentlyViewed } from "@/utils/recentlyViewed";
import { useInventory } from "@/hooks/useInventory";
import NotifyMeButton from "@/components/NotifyMeButton";
import { useAuth } from "@/utils/AuthContext";
import { SkeletonProductDetail } from "@/components/skeletons";
import mongoose from "mongoose";

export default function ProductDetail(props) {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { user: session } = useAuth();

  // Real-time inventory tracking
  const { stock, isConnected, isLowStock, isSoldOut } = useInventory(
    product?._id,
    product?.countInStock || 0
  );

  // Show notifications for stock changes
  useEffect(() => {
    if (!product) return;

    const handleStockUpdate = (data) => {
      if (data.productId === product._id) {
        if (data.newStock === 0) {
          toast.error(`${product.name} just sold out!`, {
            icon: '🚫',
          });
        } else if (data.newStock <= 5 && data.oldStock > 5) {
          toast.warning(`Only ${data.newStock} left in stock!`, {
            icon: '⚠️',
          });
        } else if (data.newStock < data.oldStock) {
          toast.info(`Stock updated: ${data.newStock} available`, {
            icon: '📦',
          });
        }
      }
    };

    if (typeof window !== 'undefined' && window.io) {
      // Listen for stock updates
      const socket = window.io();
      socket.on('stock-updated', handleStockUpdate);

      return () => {
        socket.off('stock-updated', handleStockUpdate);
      };
    }
  }, [product]);

  // Track product view in recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product]);

  if (!product) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto px-4 py-8">
          <SkeletonProductDetail />
        </div>
      </Layout>
    );
  }

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto px-4 py-8">
          <SkeletonProductDetail />
        </div>
      </Layout>
    );
  }

  if (product === 'not-found') {
    return (
      <Layout title="Product Not Found">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/">
            <button className="primary-button">Go to Homepage</button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isInWishlist = state.wishlist.wishlistItems.some(
    (item) => item.slug === product.slug
  );

  const isInCompare = state.compare.compareItems.some(
    (item) => item.slug === product.slug
  );

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find(
      (item) => item.slug === product.slug
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: quantity },
    });

    router.push("/cart");
  };

  const ratingChanged = async (productId, count) => {
    try {
      await axios.put(`/api/products/${productId}`, {
        rating: count,
      });
      toast.success(
        "Thank you for rating! Your feedback helps other shoppers."
      );
      router.reload();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const toggleWishlistHandler = () => {
    if (isInWishlist) {
      dispatch({ type: "WISHLIST_REMOVE_ITEM", payload: product });
      toast.success("Removed from wishlist");
    } else {
      dispatch({ type: "WISHLIST_ADD_ITEM", payload: product });
      toast.success("Added to wishlist");
    }
  };

  const toggleCompareHandler = () => {
    if (isInCompare) {
      dispatch({ type: "COMPARE_REMOVE_ITEM", payload: product });
      toast.success("Removed from comparison");
    } else {
      if (state.compare.compareItems.length >= 4) {
        toast.error("Maximum 4 products can be compared");
        return;
      }
      dispatch({ type: "COMPARE_ADD_ITEM", payload: product });
      toast.success("Added to comparison");
    }
  };

  return (
    <Layout
      title={product.name}
      breadcrumbProps={{
        productName: product.name,
        categoryName: product.category,
      }}
    >
      <div className="py-2">
        <Link href="/">
          <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">← Back to products</span>
        </Link>
      </div>
      <div className="grid md:grid-cols-4 md:gap-3 my-4">
        <div className="md:col-span-2">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <ul className="space-y-3">
            <li>
              <h1 className="text-2xl font-bold dark:text-white">{product.name}</h1>
            </li>
            <li className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Category:</span> {product.category}
            </li>
            <li className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Brand:</span> {product.brand}
            </li>
            <li className="flex items-center space-x-2">
              <ReactStars
                count={5}
                size={26}
                activeColor="#ffd700"
                value={product.rating}
                edit={false}
              />
              <span className="text-gray-600 dark:text-gray-300">
                ({product.totalRatings} {product.totalRatings === 1 ? 'rating' : 'ratings'})
              </span>
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Description:</span>
              <p className="mt-1">{product.description}</p>
            </li>
            <li className="pt-4">
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="font-semibold mb-2 dark:text-white">Rate this product:</p>
                <ReactStars
                  count={5}
                  onChange={(count) => {
                    ratingChanged(product._id, count);
                  }}
                  size={32}
                  activeColor="#ffd700"
                  edit={true}
                />
              </div>
            </li>
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <h2 className="mb-2 text-lg font-bold dark:text-white">Price</h2>
            <div className="mb-2 flex justify-between">
              <div className="font-semibold dark:text-gray-300">Price</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${product.price}</div>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <div className="font-semibold dark:text-gray-300">Status</div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
                {isSoldOut ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    Low Stock ({stock} left)
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-semibold">In Stock</span>
                )}
              </div>
            </div>
            {stock > 0 && (
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {stock} {stock === 1 ? 'item' : 'items'} available
              </div>
            )}
            <button
              className="primary-button w-full"
              onClick={addToCartHandler}
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Stock Notification Button */}
            {isSoldOut && (
              <div className="mt-2">
                <NotifyMeButton
                  product={product}
                  userEmail={session?.user?.email}
                  className="w-full"
                />
              </div>
            )}

            <button
              className={`w-full mt-2 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isInWishlist
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              onClick={toggleWishlistHandler}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isInWishlist ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            <button
              className={`w-full mt-2 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isInCompare
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              onClick={toggleCompareHandler}
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
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection productId={product._id} />

      {/* Recently Viewed Products */}
      <RecentlyViewed currentProductSlug={product.slug} limit={8} />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();

  // Import soldCount utility
  const { calculateSoldCount } = await import('@/utils/soldCount');

  const product = await Product.findOne({ slug: slug }).lean();

  if (product) {
    // Get the actual review count from Review collection
    const Review = (await import("@/models/Review")).default;

    // Convert product._id to ObjectId for proper querying
    const productObjectId = new mongoose.Types.ObjectId(product._id);

    const reviewCount = await Review.countDocuments({
      product: productObjectId,
      status: "approved"
    });

    // Get actual average rating from reviews
    const reviews = await Review.find({
      product: productObjectId,
      status: "approved"
    }).select('rating').lean();

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Calculate sold count from orders
    const soldCount = await calculateSoldCount(productObjectId);

    // Update product with actual values
    product.numReviews = reviewCount;
    product.totalRatings = reviewCount;
    product.rating = avgRating;
    product.soldCount = soldCount;
  }

  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
