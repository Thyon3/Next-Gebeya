import StockNotification from '@/models/StockNotification';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, email } = req.query;

  if (!productId || !email) {
    return res.status(400).json({ message: 'Product ID and email are required' });
  }

  try {
    await db.connect();

    const notification = await StockNotification.findOne({
      product: productId,
      email: email.toLowerCase(),
      notified: false, // Only check for pending notifications
    });

    
    res.status(200).json({
      subscribed: !!notification,
      notification: notification || null,
    });
  } catch (error) {
        console.error('Check subscription error:', error);
    res.status(500).json({ message: 'Failed to check subscription status' });
  }
};

export default handler;
