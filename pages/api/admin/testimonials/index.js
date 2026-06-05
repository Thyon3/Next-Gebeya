import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import Testimonial from '@/models/Testimonial';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  try {
    await db.connect();
    const testimonials = await Testimonial.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
        res.status(200).json(testimonials);
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

const postHandler = async (req, res) => {
  try {
    await db.connect();
    const newTestimonial = new Testimonial({
      name: req.body.name,
      role: req.body.role || 'Verified Buyer',
      image: req.body.image,
      rating: req.body.rating,
      text: req.body.text,
      product: req.body.product,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      order: req.body.order || 0,
    });
    const testimonial = await newTestimonial.save();
        res.status(201).json(testimonial);
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

export default handler;
