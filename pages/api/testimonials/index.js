import { getSession } from 'next-auth/react';
import Testimonial from '@/models/Testimonial';
import Review from '@/models/Review';
import Product from '@/models/Product';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  try {
    await db.connect();
    
    // Check if stats are requested
    const { stats } = req.query;
    
    if (stats === 'true') {
      // Get testimonials
      const testimonials = await Testimonial.find({ isActive: true }).lean();
      
      // Get approved product reviews with 4+ stars
      const productReviews = await Review.find({ 
        status: 'approved',
        rating: { $gte: 4 }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
      
      // Get product names for reviews
      const reviewsWithProducts = await Promise.all(
        productReviews.map(async (review) => {
          const product = await Product.findById(review.product).select('name').lean();
          return {
            _id: review._id,
            name: review.userName,
            role: 'Verified Buyer',
            text: review.comment,
            rating: review.rating,
            product: product?.name || 'Product',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`,
            isActive: true,
            order: 999, // Put reviews after testimonials
            createdAt: review.createdAt
          };
        })
      );
      
      // Combine testimonials and reviews
      const allTestimonials = [...testimonials, ...reviewsWithProducts];
      
      if (allTestimonials.length === 0) {
                return res.status(200).json({
          averageRating: 0,
          totalReviews: 0,
          testimonials: []
        });
      }
      
      // Calculate average rating
      const totalRating = allTestimonials.reduce((sum, t) => sum + t.rating, 0);
      const averageRating = (totalRating / allTestimonials.length).toFixed(1);
      
      // Sort by order, then by date
      const sortedTestimonials = allTestimonials.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
            return res.status(200).json({
        averageRating: parseFloat(averageRating),
        totalReviews: allTestimonials.length,
        testimonials: sortedTestimonials
      });
    }
    
    // Regular testimonials fetch (without reviews)
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
        res.status(200).json(testimonials);
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

export default handler;
