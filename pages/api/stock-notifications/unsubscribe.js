import StockNotification from '@/models/StockNotification';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, productId, email } = req.query;

  try {
    await db.connect();

    let notification;

    // Unsubscribe via token (from email link)
    if (token) {
      notification = await StockNotification.findOneAndDelete({
        unsubscribeToken: token,
      });
    } 
    // Unsubscribe via productId and email (from UI)
    else if (productId && email) {
      notification = await StockNotification.findOneAndDelete({
        product: productId,
        email: email.toLowerCase(),
      });
    } else {
      return res.status(400).json({ 
        message: 'Either token or productId and email are required' 
      });
    }

    
    if (!notification) {
      return res.status(404).json({ 
        message: 'Notification subscription not found' 
      });
    }

    res.status(200).json({
      message: 'Successfully unsubscribed from stock notifications',
    });
  } catch (error) {
        console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again.' });
  }
};

export default handler;
