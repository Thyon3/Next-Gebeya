import { isAuth, isAdmin } from '@/utils/auth';
import Testimonial from '@/models/Testimonial';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch (e) { return; }
  if (!user.isAdmin) {
    return res.status(401).send({ message: 'Admin sign in required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();

    // Check if testimonials already exist
    const existingCount = await Testimonial.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        message: 'Testimonials already exist. Delete them first if you want to reseed.'
      });
    }

    const sampleTestimonials = [
      {
        name: "Sarah Johnson",
        role: "Verified Buyer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=4F46E5",
        rating: 5,
        text: "Amazing quality and fast shipping! The products exceeded my expectations. Will definitely shop here again.",
        product: "Wireless Headphones",
        isActive: true,
        order: 1,
      },
      {
        name: "Michael Chen",
        role: "Verified Buyer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=10B981",
        rating: 5,
        text: "Best online shopping experience I've had. Customer service was incredibly helpful and responsive.",
        product: "Smart Watch Pro",
        isActive: true,
        order: 2,
      },
      {
        name: "Emily Rodriguez",
        role: "Verified Buyer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=F59E0B",
        rating: 5,
        text: "Great prices and excellent product selection. The website is easy to navigate and checkout was smooth.",
        product: "Premium Laptop Bag",
        isActive: true,
        order: 3,
      },
    ];

    await Testimonial.insertMany(sampleTestimonials);

    res.status(201).json({
      message: 'Testimonials seeded successfully',
      count: sampleTestimonials.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
