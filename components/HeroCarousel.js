import Link from 'next/link';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel';
import CountdownTimer from './CountdownTimer';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useContext, useState, useEffect } from 'react';
import { Store } from '@/utils/Store';

export default function HeroCarousel({ featuredProducts, addToCartHandler }) {
  const { state } = useContext(Store);
  const [settings, setSettings] = useState(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const promoMessages = [
    { text: 'Fast Delivery', icon: '⚡' },
    { text: 'Free Coupon', icon: '🎁' },
    { text: 'Welcome Offer', icon: '✨' },
    { text: 'Best Prices', icon: '💰' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Rotate promo messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [promoMessages.length]);

  const getDisplayPrice = (product) => {
    if (product.isFlashSale && product.flashSalePrice) {
      return product.flashSalePrice;
    }
    return product.price;
  };

  const getOriginalPrice = (product) => {
    if (product.isFlashSale && product.flashSalePrice) {
      return product.price;
    }
    return null;
  };

  const calculateDiscount = (product) => {
    if (product.discountPercentage) {
      return product.discountPercentage;
    }
    if (product.isFlashSale && product.flashSalePrice) {
      return Math.round(((product.price - product.flashSalePrice) / product.price) * 100);
    }
    return 0;
  };

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const existItem = state.cart.cartItems.find((item) => item.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    addToCartHandler(product);
  };

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  const shopNowText = settings?.heroShopNowText || 'Shop Now';
  const addToCartText = settings?.heroAddToCartText || 'Add to Cart';
  const learnMoreText = settings?.heroLearnMoreText || 'Learn More';

  return (
    <div className="-mx-8 md:-mx-12 xl:-mx-14 mb-8">
      <Carousel 
        showThumbs={false} 
        autoPlay 
        infiniteLoop 
        interval={5000}
        showStatus={false}
        className="hero-carousel"
      >
        {featuredProducts.map((product) => {
          const discount = calculateDiscount(product);
          const displayPrice = getDisplayPrice(product);
          const originalPrice = getOriginalPrice(product);

          return (
            <div key={product._id} className="relative">
              <Link href={`/product/${product.slug}`} passHref>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden cursor-pointer group">
                  <Image
                    src={product.banner}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-8 left-8 flex flex-col gap-2">
                    {product.isNewArrival && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-full text-sm font-bold shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        NEW
                      </span>
                    )}
                    
                    {discount > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary-500 text-white rounded-full text-sm font-bold shadow-lg animate-blink">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-7xl mx-auto px-8">
                      {/* Flash Sale Timer */}
                      {product.isFlashSale && product.flashSaleEndDate && (
                        <div className="mb-4">
                          <CountdownTimer endDate={product.flashSaleEndDate} />
                        </div>
                      )}

                      {/* Rotating Promotional Message - Clean Text Only */}
                      <div className="mb-6">
                        <p className="text-white/80 text-xs md:text-sm font-semibold uppercase tracking-wider mb-2 animate-fade-in-up">
                          Special Offer
                        </p>
                        <div className="h-8 md:h-10 flex items-center relative">
                          {promoMessages.map((promo, index) => (
                            <div
                              key={index}
                              className={`absolute transition-all duration-500 ${
                                index === currentPromoIndex
                                  ? 'opacity-100 translate-y-0'
                                  : 'opacity-0 -translate-y-4'
                              }`}
                            >
                              <p className="text-white text-lg md:text-2xl font-bold drop-shadow-lg flex items-center gap-2">
                                <span className="text-2xl md:text-3xl">{promo.icon}</span>
                                {promo.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Product Name */}
                      <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 drop-shadow-2xl tracking-tight leading-tight animate-fade-in-up animation-delay-800">
                        {product.name}
                      </h2>

                      {/* Price */}
                      <div className="flex items-baseline gap-3 mb-6 animate-fade-in-up animation-delay-1000">
                        <p className="text-white text-2xl md:text-4xl lg:text-5xl font-black drop-shadow-2xl tracking-tight">
                          ${displayPrice}
                        </p>
                        {originalPrice && (
                          <p className="text-gray-300 text-lg md:text-2xl lg:text-3xl line-through opacity-70 font-medium">
                            ${originalPrice}
                          </p>
                        )}
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap gap-3 md:gap-4 animate-fade-in-up animation-delay-1200">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/product/${product.slug}`;
                          }}
                          className="px-6 py-3 md:px-8 md:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-sm md:text-base tracking-wide shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                        >
                          {shopNowText}
                        </button>
                        
                        <button 
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="px-6 py-3 md:px-8 md:py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-bold text-sm md:text-base tracking-wide shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {addToCartText}
                        </button>

                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/product/${product.slug}`;
                          }}
                          className="px-6 py-3 md:px-8 md:py-4 bg-transparent border-2 border-white hover:bg-white/20 text-white rounded-lg font-bold text-sm md:text-base tracking-wide backdrop-blur-sm shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                          {learnMoreText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}
