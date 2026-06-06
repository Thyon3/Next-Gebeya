import StockNotification from '@/models/StockNotification';
import Product from '@/models/Product';
import db from '@/utils/db';
import { sendBackInStockEmail } from '@/utils/email';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    await db.connect();

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.countInStock === 0) {
      return res.status(400).json({ 
        message: 'Product is still out of stock' 
      });
    }

    // Get all pending notifications for this product
    const notifications = await StockNotification.find({
      product: productId,
      notified: false,
    });

    if (notifications.length === 0) {
            return res.status(200).json({ 
        message: 'No pending notifications for this product',
        sent: 0 
      });
    }

    // Send emails to all subscribers
    let successCount = 0;
    let failCount = 0;

    for (const notification of notifications) {
      try {
        await sendBackInStockEmail({
          email: notification.email,
          product: {
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.image,
          },
          unsubscribeToken: notification.unsubscribeToken,
        });

        // Mark as notified
        notification.notified = true;
        notification.notifiedAt = new Date();
        await notification.save();

        successCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${notification.email}:`, emailError);
        failCount++;
      }
    }

    
    res.status(200).json({
      message: `Sent ${successCount} notifications successfully`,
      sent: successCount,
      failed: failCount,
      total: notifications.length,
    });
  } catch (error) {
        console.error('Send notifications error:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
};

export default handler;
