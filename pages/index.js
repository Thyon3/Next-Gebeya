import Layout from "@/components/Layout";
import ProductItem from "@/components/ProductItem";
import RecentlyViewed from "@/components/RecentlyViewed";
import HeroCarousel from "@/components/HeroCarousel";
import TrustBadges from "@/components/TrustBadges";
import Testimonials from "@/components/Testimonials";
import NewsletterSection from "@/components/NewsletterSection";
import BrandShowcase from "@/components/BrandShowcase";
import CategoryShowcase from "@/components/CategoryShowcase";
import { SkeletonHeroCarousel, SkeletonProductGrid } from "@/components/skeletons";
import Product from "@/models/Product";
import Category from "@/models/Category";
import db from "@/utils/db";
import { Store } from "@/utils/Store";
import axios from "axios";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";

import { useAuth } from "@/utils/AuthContext";
import { useRouter } from "next/router";

export default function Home({ featuredProducts = [], products = [], brands = [], categories = [], settings: initialSettings = {} }) {
  const { state, dispatch } = useContext(Store);
  const { user } = useAuth();
  const router = useRouter();
  const { cart } = state;
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(initialSettings);

  // Redirect admin users to dashboard
  useEffect(() => {
    if (user && user.isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  // Fetch fresh settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/site-settings');
        if (response.data.success) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        // Silently fail and use initial settings
      }
    };

    fetchSettings();
  }, []);

  // Ensure settings have defaults
  const siteSettings = {
    latestProductsEnabled: settings.latestProductsEnabled !== false,
    latestProductsHeading: settings.latestProductsHeading || 'Latest Products',
    latestProductsCount: settings.latestProductsCount || 8,
    categoryProductsEnabled: settings.categoryProductsEnabled !== false,
    categoryProductsViewAllText: settings.categoryProductsViewAllText || 'View All',
    categoryProductsCount: settings.categoryProductsCount || 4,
    brandShowcaseEnabled: settings.brandShowcaseEnabled !== false,
    testimonialsEnabled: settings.testimonialsEnabled !== false,
    recentlyViewedEnabled: settings.recentlyViewedEnabled !== false,
    recentlyViewedLimit: settings.recentlyViewedLimit || 8,
    newsletterEnabled: settings.newsletterEnabled !== false,
    ...settings,
  };

  useEffect(() => {
    // Simulate initial loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((item) => item.slug === product.slug);
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

    toast.success("Product added to the cart");
  };

  return (
    <Layout title="Home">
      {/* Enhanced Hero Carousel */}
      {isLoading ? (
        <SkeletonHeroCarousel />
      ) : (
        featuredProducts.length > 0 && (
          <HeroCarousel
            featuredProducts={featuredProducts}
            addToCartHandler={addToCartHandler}
          />
        )
      )}

      {/* Latest Products - Moved to top */}
      {siteSettings.latestProductsEnabled && (
        <div className="mb-12 mt-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">{siteSettings.latestProductsHeading}</h1>
          {isLoading ? (
            <SkeletonProductGrid count={siteSettings.latestProductsCount} />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, siteSettings.latestProductsCount).map((product) => (
                <ProductItem
                  product={product}
                  key={product.slug}
                  addToCartHandler={addToCartHandler}
                  allProducts={products}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Showcase */}
      <CategoryShowcase categories={categories} />

      {/* Brand Showcase */}
      {siteSettings.brandShowcaseEnabled && brands.length > 0 && (
        <BrandShowcase brands={brands} settings={siteSettings} />
      )}


      {/* Recently Viewed Products */}
      {siteSettings.recentlyViewedEnabled && (
        <RecentlyViewed limit={siteSettings.recentlyViewedLimit} />
      )}

      {/* Customer Testimonials */}
      {siteSettings.testimonialsEnabled && <Testimonials settings={siteSettings} />}

      {/* Newsletter Subscription */}
      {siteSettings.newsletterEnabled && <NewsletterSection />}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    // Set cache headers to prevent stale data
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );

    await db.connect();

    // Import soldCount utility
    const { addSoldCountsToProducts } = await import('@/utils/soldCount');

    let products = await Product.find().lean().sort({ createdAt: -1 });

    // Add sold counts to all products
    products = await addSoldCountsToProducts(products);

    const featuredProducts = products.filter(
      (product) => product.isFeatured === true
    );

    // Get all unique categories from products
    const productCategories = await Product.distinct('category');

    // Get styling info from Category collection
    const categoryStyles = await Category.find({}).lean();
    const styleMap = {};
    categoryStyles.forEach(cat => {
      styleMap[cat.name] = cat;
    });

    // Combine product categories with their styling
    const categoriesWithCounts = productCategories.map((categoryName) => {
      const productCount = products.filter(p => p.category === categoryName).length;
      const style = styleMap[categoryName] || {};

      return {
        name: categoryName,
        icon: style.icon || '📦',
        gradient: style.gradient || 'from-blue-500 to-cyan-500',
        bgColor: style.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
        image: style.image || '',
        description: style.description || '',
        order: style.order || 0,
        productCount,
      };
    }).filter(cat => cat.productCount > 0);

    // Sort by order, then by name
    categoriesWithCounts.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    // Extract and count brands
    const brandMap = {};
    products.forEach((product) => {
      const brand = product.brand;
      if (brand) {
        if (!brandMap[brand]) {
          brandMap[brand] = {
            name: brand,
            productCount: 0,
            logo: product.brandLogo || null,
          };
        }
        brandMap[brand].productCount++;
        if (!brandMap[brand].logo && product.brandLogo) {
          brandMap[brand].logo = product.brandLogo;
        }
      }
    });

    const brands = Object.values(brandMap).sort(
      (a, b) => b.productCount - a.productCount
    );

    // Fetch site settings
    const SiteSettings = (await import('@/models/SiteSettings')).default;
    let settings = await SiteSettings.findOne().lean();

    const cleanSettings = settings ? {
      latestProductsHeading: settings.latestProductsHeading || 'Latest Products',
      latestProductsCount: settings.latestProductsCount || 8,
      latestProductsEnabled: settings.latestProductsEnabled !== false,
      categoryProductsViewAllText: settings.categoryProductsViewAllText || 'View All',
      categoryProductsCount: settings.categoryProductsCount || 4,
      categoryProductsEnabled: settings.categoryProductsEnabled !== false,
      brandShowcaseHeading: settings.brandShowcaseHeading || 'Shop by Brand',
      brandShowcaseEnabled: settings.brandShowcaseEnabled !== false,
      testimonialsHeading: settings.testimonialsHeading || 'What Our Customers Say',
      testimonialsEnabled: settings.testimonialsEnabled !== false,
      recentlyViewedLimit: settings.recentlyViewedLimit || 8,
      recentlyViewedEnabled: settings.recentlyViewedEnabled !== false,
      newsletterEnabled: settings.newsletterEnabled !== false,
    } : {
      latestProductsHeading: 'Latest Products',
      latestProductsCount: 8,
      latestProductsEnabled: true,
      categoryProductsViewAllText: 'View All',
      categoryProductsCount: 4,
      categoryProductsEnabled: true,
      brandShowcaseHeading: 'Shop by Brand',
      brandShowcaseEnabled: true,
      testimonialsHeading: 'What Our Customers Say',
      testimonialsEnabled: true,
      recentlyViewedLimit: 8,
      recentlyViewedEnabled: true,
      newsletterEnabled: true,
    };

    return {
      props: {
        featuredProducts: featuredProducts.map(db.convertDocToObj),
        products: products.map(db.convertDocToObj),
        brands,
        categories: categoriesWithCounts,
        settings: cleanSettings,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        featuredProducts: [],
        products: [],
        brands: [],
        categories: [],
        settings: {
          latestProductsHeading: 'Latest Products',
          latestProductsCount: 8,
          latestProductsEnabled: true,
          categoryProductsViewAllText: 'View All',
          categoryProductsCount: 4,
          categoryProductsEnabled: true,
          brandShowcaseHeading: 'Shop by Brand',
          brandShowcaseEnabled: true,
          testimonialsHeading: 'What Our Customers Say',
          testimonialsEnabled: true,
          recentlyViewedLimit: 8,
          recentlyViewedEnabled: true,
          newsletterEnabled: true,
        },
      },
    };
  }
}
