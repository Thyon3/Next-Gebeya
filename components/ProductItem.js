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
import { useAuth } from "@/utils/AuthContext";
import { useRouter } from "next/router";

export default function ProductItem({ product, addToCartHandler, allProducts }) {
  const { user: session } = useAuth();
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

  // Calculate discount if flash sale or discount percentage exists
  const hasDiscount = product.isFlashSale || (product.discountPercentage && product.discountPercentage > 0);
  const salePrice = product.isFlashSale ? product.flashSalePrice : product.price;
  const originalPrice = hasDiscount ? (product.isFlashSale ? product.price : (product.price / (1 - product.discountPercentage / 100))) : product.price;
  const displayDiscount = product.discountPercentage ? `-${product.discountPercentage}%` : (product.isFlashSale ? 'SALE' : null);

  return (
    <>
      <article
        className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 font-sans"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${product.name} product card`}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800">
          <Link href={`/product/${product.slug}`}>
            <div className="relative w-full h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
              <Image
                src={product.image}
                alt={product.name}
                className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                height={500}
                width={500}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </Link>

          {/* Top Right Lens Icon (AliExpress Style) */}
          <button
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-white transition-colors shadow-sm"
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            title="Search for similar items"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            </svg>
          </button>

          {/* Floating Add to Cart Button (Hovering Bottom Right of Image) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCartHandler(product);
            }}
            disabled={isSoldOut}
            className={`absolute bottom-3 right-3 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform ${isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-black border-2 border-gray-100'
              }`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 9v4m-2-2h4" />
            </svg>
          </button>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-white dark:bg-gray-800">
          {/* Title - Truncated with Ellipsis */}
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-[14px] leading-[1.3] text-gray-800 dark:text-gray-200 line-clamp-1 mb-2 font-normal group-hover:text-red-600 transition-colors cursor-pointer">
              {product.name}
            </h2>
          </Link>

          {/* Price Section - AliExpress Styling */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[15px] font-black text-black dark:text-white uppercase tracking-tighter">
              {currency}
            </span>
            <span className="text-[22px] font-black text-black dark:text-white -ml-1">
              {salePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[14px] text-gray-400 line-through font-normal">
                {currency}{originalPrice.toLocaleString()}
              </span>
            )}
            {displayDiscount && (
              <span className="text-[14px] font-bold text-red-600 ml-0.5">
                {displayDiscount}
              </span>
            )}
          </div>

          {/* Ratings & Sold Data */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-black dark:text-gray-100">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[14px] font-bold ml-1">
                {product.rating ? product.rating.toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="text-gray-300 dark:text-gray-600 text-sm">|</span>
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              {product.soldCount || 0}+ sold
            </span>
          </div>

          {/* Promo Line (AliExpress Red Text with Icon) */}
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-red-600 mb-4 tracking-tight truncate">
            <div className="bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-sm">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M11 15h2v2h-2v-2m0-8h2v6h-2V7m1-5C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2Z" /></svg>
            </div>
            <span>{currency}{(salePrice * 0.1).toFixed(2)} off on every {currency}{(salePrice * 2).toFixed(0)}</span>
          </div>

          {/* Hover Interaction Buttons */}
          <div className={`flex gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
              className="flex-1 bg-black dark:bg-gray-900 text-white text-[14px] font-bold py-2.5 px-2 rounded-sm hover:opacity-90 active:scale-95 transition-all text-center"
            >
              See preview
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowSimilar(true); }}
              className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-black dark:border-gray-500 text-[14px] font-bold py-2.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-center"
            >
              Similar items
            </button>
          </div>
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
