import SiteSettings from '@/models/SiteSettings';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    
    let settings = await SiteSettings.findOne().lean();
    
    // Return default settings if none exist
    if (!settings) {
      settings = {
        // Newsletter
        newsletterHeading: 'Get 10% Off Your First Order!',
        newsletterDescription: 'Subscribe to our newsletter and receive exclusive deals, new arrivals, and special offers directly to your inbox.',
        newsletterDiscountPercentage: 10,
        newsletterButtonText: 'Subscribe Now',
        newsletterEnabled: true,
        // Hero Carousel
        heroShopNowText: 'Shop Now',
        heroAddToCartText: 'Add to Cart',
        heroLearnMoreText: 'Learn More',
        // Latest Products
        latestProductsHeading: 'Latest Products',
        latestProductsCount: 8,
        latestProductsEnabled: true,
        // Category Products
        categoryProductsViewAllText: 'View All',
        categoryProductsCount: 4,
        categoryProductsEnabled: true,
        // Brand Showcase
        brandShowcaseHeading: 'Shop by Brand',
        brandShowcaseDescription: 'Discover products from your favorite brands',
        brandShowcaseViewAllText: 'View All Brands',
        brandShowcaseBadge1: 'Trusted Brands',
        brandShowcaseBadge2: 'Authentic Products',
        brandShowcaseBadge3: 'Official Partners',
        brandShowcasePerPage: 6,
        brandShowcaseEnabled: true,
        // Testimonials
        testimonialsHeading: 'What Our Customers Say',
        testimonialsDescription: 'Join thousands of satisfied customers who trust us for quality products and excellent service',
        testimonialsEnabled: true,
        // Recently Viewed
        recentlyViewedLimit: 8,
        recentlyViewedEnabled: true,
      };
    }
    
    
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
      error: error.message,
    });
  }
};

export default handler;
