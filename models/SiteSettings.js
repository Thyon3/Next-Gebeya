import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    // Newsletter Settings
    newsletterHeading: {
      type: String,
      default: 'Get 10% Off Your First Order!',
    },
    newsletterDescription: {
      type: String,
      default: 'Subscribe to our newsletter and receive exclusive deals, new arrivals, and special offers directly to your inbox.',
    },
    newsletterDiscountPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    newsletterButtonText: {
      type: String,
      default: 'Subscribe Now',
    },
    newsletterEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Hero Carousel Settings
    heroShopNowText: {
      type: String,
      default: 'Shop Now',
    },
    heroAddToCartText: {
      type: String,
      default: 'Add to Cart',
    },
    heroLearnMoreText: {
      type: String,
      default: 'Learn More',
    },
    
    // Latest Products Section
    latestProductsHeading: {
      type: String,
      default: 'Latest Products',
    },
    latestProductsCount: {
      type: Number,
      default: 8,
      min: 1,
      max: 20,
    },
    latestProductsEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Products by Category Section
    categoryProductsViewAllText: {
      type: String,
      default: 'View All',
    },
    categoryProductsCount: {
      type: Number,
      default: 4,
      min: 1,
      max: 12,
    },
    categoryProductsEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Brand Showcase Settings
    brandShowcaseHeading: {
      type: String,
      default: 'Shop by Brand',
    },
    brandShowcaseDescription: {
      type: String,
      default: 'Discover products from your favorite brands',
    },
    brandShowcaseViewAllText: {
      type: String,
      default: 'View All Brands',
    },
    brandShowcaseBadge1: {
      type: String,
      default: 'Trusted Brands',
    },
    brandShowcaseBadge2: {
      type: String,
      default: 'Authentic Products',
    },
    brandShowcaseBadge3: {
      type: String,
      default: 'Official Partners',
    },
    brandShowcasePerPage: {
      type: Number,
      default: 6,
      min: 3,
      max: 12,
    },
    brandShowcaseEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Testimonials Settings
    testimonialsHeading: {
      type: String,
      default: 'What Our Customers Say',
    },
    testimonialsDescription: {
      type: String,
      default: 'Join thousands of satisfied customers who trust us for quality products and excellent service',
    },
    testimonialsEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Recently Viewed Settings
    recentlyViewedLimit: {
      type: Number,
      default: 8,
      min: 4,
      max: 12,
    },
    recentlyViewedEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
