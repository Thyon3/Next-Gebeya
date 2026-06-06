import { isAuth, isAdmin } from '@/utils/auth';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import db from '@/utils/db';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  await db.connect();

  try {
    // Find and update coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      userId: user._id,
    });

    if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.isUsed) {
            return res.status(400).json({ message: 'Coupon already used' });
    }

    // Mark coupon as used
    coupon.isUsed = true;
    coupon.usedAt = new Date();
    await coupon.save();

    // Update user's welcome coupon status if it's a welcome coupon
    if (coupon.couponType === 'welcome') {
      await User.findByIdAndUpdate(user._id, {
        welcomeCouponUsed: true,
      });
    }

    
    res.status(200).json({
      success: true,
      message: 'Coupon marked as used',
    });
  } catch (error) {
        console.error('Mark coupon used error:', error);
    res.status(500).json({ message: 'Error updating coupon' });
  }
}

export default handler;
