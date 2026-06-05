import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import Testimonial from '@/models/Testimonial';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    return getHandler(req, res, id);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, id);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res, id) => {
  try {
    await db.connect();
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const putHandler = async (req, res, id) => {
  try {
    await db.connect();
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.name = req.body.name || testimonial.name;
    testimonial.role = req.body.role || testimonial.role;
    testimonial.image = req.body.image || testimonial.image;
    testimonial.rating = req.body.rating !== undefined ? req.body.rating : testimonial.rating;
    testimonial.text = req.body.text || testimonial.text;
    testimonial.product = req.body.product || testimonial.product;
    testimonial.isActive = req.body.isActive !== undefined ? req.body.isActive : testimonial.isActive;
    testimonial.order = req.body.order !== undefined ? req.body.order : testimonial.order;

    const updatedTestimonial = await testimonial.save();
    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHandler = async (req, res, id) => {
  try {
    await db.connect();
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    await testimonial.deleteOne();
    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
