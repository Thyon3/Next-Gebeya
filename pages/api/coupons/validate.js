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
    return res.status(401).json({ message: 'Please sign in to use coupons' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Please enter a coupon code' });
  }

  await db.connect();

  try {
    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon belongs to this user
    if (coupon.userId.toString() !== user._id) {
            return res.status(403).json({ message: 'This coupon is not valid for your account' });
    }

    // Check if already used
    if (coupon.isUsed) {
            return res.status(400).json({ message: 'This coupon has already been used' });
    }

    // Check if expired
    const now = new Date();
    if (coupon.expiryDate < now) {
            return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Check if active
    if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    
    // Return valid coupon details
    res.status(200).json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUsagePerProduct: coupon.maxUsagePerProduct,
        couponType: coupon.couponType,
        expiryDate: coupon.expiryDate,
      },
    });
  } catch (error) {
        console.error('Coupon validation error:', error);
    res.status(500).json({ message: 'Error validating coupon' });
  }
}

export default handler;
