import StockNotification from '@/models/StockNotification';
import Product from '@/models/Product';
import db from '@/utils/db';
import crypto from 'crypto';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, email } = req.body;

  // Validate input
  if (!productId || !email) {
    return res.status(400).json({ message: 'Product ID and email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    await db.connect();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.countInStock > 0) {
      return res.status(400).json({ 
        message: 'Product is currently in stock. You can purchase it now!' 
      });
    }

    // Check if already subscribed
    const existingNotification = await StockNotification.findOne({
      product: productId,
      email: email.toLowerCase(),
    });

    if (existingNotification) {
      if (existingNotification.notified) {
        // Reset the notification if it was already sent
        existingNotification.notified = false;
        existingNotification.notifiedAt = null;
        await existingNotification.save();
        return res.status(200).json({ 
          message: 'Your notification request has been updated',
          notification: existingNotification 
        });
      }
      return res.status(200).json({ 
        message: 'You are already subscribed to notifications for this product',
        notification: existingNotification 
      });
    }

    // Generate unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create new notification request
    const notification = await StockNotification.create({
      product: productId,
      email: email.toLowerCase(),
      unsubscribeToken,
    });

    
    res.status(201).json({
      message: 'Successfully subscribed! We will notify you when this product is back in stock.',
      notification,
    });
  } catch (error) {
        console.error('Subscribe error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'You are already subscribed to notifications for this product' 
      });
    }
    
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
};

export default handler;
