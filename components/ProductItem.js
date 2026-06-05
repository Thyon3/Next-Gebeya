import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Store } from "@/utils/Store";
import { formatPrice } from "@/utils/currency";
import { toast } from "react-toastify";
import ProductQuickView from "./ProductQuickView";
import SimilarProducts from "./SimilarProducts";
import LiveStockBadge from "./LiveStockBadge";
import { useInventory } from "@/hooks/useInventory";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function ProductItem({ product, addToCartHandler, allProducts }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { currency, wishlist, compare } = state;
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const productWithImages = {
    ...product,
    images: Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : []
  };

  const { stock, isConnected, isLowStock, isSoldOut } = useInventory(
    product._id,
    product.countInStock
  );

  const isInWishlist = wishlist.wishlistItems.some(
    (item) => item.slug === product.slug
  );

  const isInCompare = compare.compareItems.some(
    (item) => item.slug === product.slug
  );

  const toggleWishlistHandler = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!session) {
      toast.info("Please sign in to add items to your wishlist");
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    
    if (isInWishlist) {
      dispatch({ type: "WISHLIST_REMOVE_ITEM", payload: product });
      toast.success("Removed from wishlist");
    } else {
      dispatch({ type: "WISHLIST_ADD_ITEM", payload: product });
      toast.success("Added to wishlist");
    }
  };

  const toggleCompareHandler = (e) => {
    e.preventDefault();
    if (isInCompare) {
      dispatch({ type: "COMPARE_REMOVE_ITEM", payload: product });
      toast.success("Removed from comparison");
    } else {
      if (compare.compareItems.length >= 4) {
        toast.error("Maximum 4 products can be compared");
        return;
      }
      dispatch({ type: "COMPARE_ADD_ITEM", payload: product });
      toast.success("Added to comparison");
    }
  };

  const truncateName = (name, wordLimit = 4) => {
    const words = name.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return name;
  };

  return (
    <>
      <article 
        className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${product.name} product card`}
      >
        {/* Image Container with Overlay */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900">
          <Link href={`/product/${product.slug}`}>
            <div className="relative h-72 w-full">
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
              )}
              
              <Image
                src={product.image}
                alt={`${product.name} - ${product.brand}`}
                className={`object-cover object-top w-full h-full transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                height={400}
                width={400}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>

          {/* Action Buttons - Top Right */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            {/* Wishlist Button */}
            <button
              onClick={toggleWishlistHandler}
              className={`backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 transform hover:scale-110 ${
                isInWishlist ? 'scale-110' : ''
              }`}
              aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isInWishlist}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isInWishlist ? "#ef4444" : "none"}
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke={isInWishlist ? "#ef4444" : "currentColor"}
                className={`w-5 h-5 transition-all duration-300 ${
                  isInWishlist ? 'animate-pulse' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>

            {/* Compare Button */}
            <button
              onClick={toggleCompareHandler}
              className={`backdrop-blur-md rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 border transform hover:scale-110 ${
                isInCompare 
                  ? "bg-purple-600 border-purple-600 scale-110" 
                  : "bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-600/50"
              }`}
              aria-label={isInCompare ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
              aria-pressed={isInCompare}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke={isInCompare ? "white" : "currentColor"}
                className={`w-5 h-5 transition-all duration-300 ${
                  !isInCompare ? 'text-gray-700 dark:text-gray-300' : ''
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </button>
          </div>

          {/* Quick Action Buttons - Bottom (Visible on Hover) */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-500 transform ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="flex-1 backdrop-blur-md bg-white/95 dark:bg-gray-800/95 hover:bg-blue-600 hover:text-white text-gray-800 dark:text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 text-sm shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center gap-2"
              aria-label={`Quick view for ${product.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Quick View
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowSimilar(true);
              }}
              className="flex-1 backdrop-blur-md bg-white/95 dark:bg-gray-800/95 hover:bg-green-600 hover:text-white text-gray-800 dark:text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 text-sm shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center gap-2"
              aria-label={`View products similar to ${product.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Similar
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          {/* Brand Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {product.brand}
            </span>
            <LiveStockBadge 
              stock={stock}
              isConnected={isConnected}
              isLowStock={isLowStock}
              isSoldOut={isSoldOut}
              size="sm"
            />
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`}>
            <h2 
              className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]" 
              title={product.name}
            >
              {product.name}
            </h2>
          </Link>

          {/* Rating & Social Proof - AliExpress Style */}
          <div className="flex items-center gap-3 py-2">
            {/* Stars */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600 fill-current'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
              </span>
            </div>

            {/* Divider */}
            <span className="text-gray-300 dark:text-gray-600">|</span>

            {/* Reviews Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="font-medium">{product.numReviews || 0}</span>
            </div>

            {/* Divider */}
            <span className="text-gray-300 dark:text-gray-600">|</span>

            {/* Sold Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-medium">{product.soldCount || 0} sold</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {formatPrice(product.price, currency)}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
              isSoldOut
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
            type="button"
            onClick={() => addToCartHandler(product)}
            disabled={isSoldOut}
            aria-label={isSoldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            {!isSoldOut && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            {isSoldOut ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Notify Me Link */}
          {isSoldOut && (
            <Link href={`/product/${product.slug}`}>
              <div className="text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 py-2">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Get notified when available
              </div>
            </Link>
          )}
        </div>
      </article>

      {/* Modals */}
      <ProductQuickView
        product={productWithImages}
        isOpen={showQuickView}
        closeModal={() => setShowQuickView(false)}
        currency={currency}
        onAddToCart={addToCartHandler}
      />

      <SimilarProducts
        product={productWithImages}
        allProducts={allProducts || []}
        isOpen={showSimilar}
        closeModal={() => setShowSimilar(false)}
        currency={currency}
        onAddToCart={addToCartHandler}
      />
    </>
  );
}
