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
import { currencyMetadata } from "@/utils/currency";

export default function ProductDetail(props) {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { user: session } = useAuth();
  const { currency } = state;

  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);

  // Real-time inventory tracking
  const { stock, isConnected, isLowStock, isSoldOut } = useInventory(
    product?._id,
    product?.countInStock || 0
  );

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      addToRecentlyViewed(product);
    }
  }, [product]);

  if (!product || product === 'not-found') {
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

  const currencySymbol = currencyMetadata[currency]?.symbol || currency;
  const salePrice = product.isFlashSale ? product.flashSalePrice : product.price;

  const addToCartHandler = async (redirect = true) => {
    const existItem = state.cart.cartItems.find((item) => item.slug === product.slug);
    const totalQuantity = existItem ? existItem.quantity + quantity : quantity;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < totalQuantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: totalQuantity },
    });

    if (redirect) router.push("/cart");
    else toast.success("Added to cart!");
  };

  const toggleWishlistHandler = () => {
    const isInWishlist = state.wishlist.wishlistItems.some((item) => item.slug === product.slug);
    if (isInWishlist) {
      dispatch({ type: "WISHLIST_REMOVE_ITEM", payload: product });
      toast.success("Removed from wishlist");
    } else {
      dispatch({ type: "WISHLIST_ADD_ITEM", payload: product });
      toast.success("Added to wishlist");
    }
  };

  const images = [product.image, ...(product.images || [])];

  return (
    <Layout title={product.name} hideBanner={true}>
      <div className="max-w-[1280px] mx-auto px-4 py-8 font-sans">
        {/* Breadcrumb replacement */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <span className="hover:text-red-600 cursor-pointer">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Image Gallery */}
          <div className="lg:w-[540px] flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {images.map((img, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedImage(img)}
                  className={`w-14 h-14 border-2 rounded-md overflow-hidden cursor-pointer transition-all ${selectedImage === img ? 'border-red-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
              <Image
                src={selectedImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
              </div>
            </div>
          </div>

          {/* CENTER/RIGHT: Info Section */}
          <div className="flex-1 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Product Header */}
              <div className="space-y-4">
                <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Description with proper formatting and word wrap */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Product Description
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed break-words overflow-wrap-anywhere" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {product.description}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ReactStars count={5} size={16} activeColor="#ffd700" value={product.rating} edit={false} />
                    <span className="font-bold border-b border-gray-900">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-900 font-medium decoration-underline">{product.numReviews} Reviews</span>
                  <span className="text-gray-400 text-xs">|</span>
                  <span className="text-gray-500">{product.soldCount || '2,000+'} sold</span>
                </div>
              </div>

              {/* Price Area */}
              <div className="bg-red-50/30 p-4 rounded-xl border border-red-50">
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-black text-red-600">{currencySymbol}{salePrice.toFixed(2)}</span>
                  {product.discountPercentage > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">{product.discountPercentage}% off</span>
                      <span className="text-gray-400 line-through text-lg">{currencySymbol}{product.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-[12px] text-red-600 font-bold mt-1">
                  Additional taxes & fees may apply. Tax included.
                </div>
                {/* Coupon Placeholder */}
                <div className="mt-3 flex items-center gap-2 p-2 bg-white rounded border border-red-100 text-sm text-red-600 font-bold">
                  <div className="bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-sm text-[10px]">%</div>
                  <span>{currencySymbol}{(salePrice * 0.1).toFixed(2)} off on {currencySymbol}{(salePrice * 2).toFixed(0)}</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>

              {/* Variant Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-3 block">Color: <span className="font-medium">Rose Red</span></label>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`w-12 h-12 border rounded cursor-pointer overflow-hidden p-0.5 ${selectedImage === img ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <img src={img} className="w-full h-full object-cover rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2 block">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-full w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-1.5 hover:bg-gray-100 rounded-l-full font-bold"
                    >-</button>
                    <span className="px-4 font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-1.5 hover:bg-gray-100 rounded-r-full font-bold"
                    >+</button>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-2">Max. {product.countInStock} pcs/shopper</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => addToCartHandler(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-full text-lg shadow-lg active:scale-[0.98] transition-all"
                >
                  Buy now
                </button>
                <button
                  onClick={() => addToCartHandler(false)}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-bold py-4 rounded-full text-lg active:scale-[0.98] transition-all"
                >
                  Add to cart
                </button>
              </div>

              <div className="flex gap-8 pt-4">
                <button className="flex items-center gap-2 text-sm font-bold hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 10-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 10-5.368-2.684z" /></svg>
                  Share
                </button>
                <button
                  onClick={toggleWishlistHandler}
                  className="flex items-center gap-2 text-sm font-bold hover:text-red-600 transition-colors"
                >
                  <svg className={`w-5 h-5 ${state.wishlist.wishlistItems.some(i => i.slug === product.slug) ? 'fill-red-600 text-red-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  694
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Trust/Seller Info */}
            <div className="lg:w-[280px] space-y-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Sold By</span>
                  <Link href="#" className="text-gray-900 border-b border-gray-900">VACOMUL Factory Store</Link>
                </div>
                <button className="w-full py-2 border rounded-full text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Message
                </button>
              </div>

              <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-4">
                <div className="text-[12px] font-bold text-green-600">Service commitment</div>
                <div className="space-y-3 text-[13px]">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div className="flex-1">
                      <p className="font-bold flex justify-between">Shipping: {currencySymbol}2,694.37 <svg className="w-3 h-3 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></p>
                      <p className="text-gray-500">Delivery: Aug 20. Item ships within 14 days</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="flex-1">
                      <p className="font-bold flex justify-between">Return & refund policy <svg className="w-3 h-3 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <div className="flex-1">
                      <p className="font-bold flex justify-between">Security & Privacy <svg className="w-3 h-3 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></p>
                      <p className="text-gray-500 text-[11px]">Safe payments: We do not share your personal details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <ReviewsSection productId={product._id} />
        </div>

        {/* Recently Viewed Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
          <RecentlyViewed currentProductSlug={product.slug} limit={8} />
        </div>
      </div>
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
