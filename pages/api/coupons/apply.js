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
    console.log('No user found in apply coupon API');
    return res.status(401).json({ message: 'Please sign in to use coupons' });
  }

  console.log('user found:', user.email);

  const { code, cartTotal } = req.body;

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

    // Validate coupon
    if (!coupon.isValid()) {
            return res.status(400).json({ 
        message: coupon.isUsed 
          ? 'This coupon has already been used' 
          : 'This coupon has expired or is inactive' 
      });
    }

    // Check if coupon belongs to this user
    if (coupon.userId.toString() !== user._id) {
            return res.status(403).json({ message: 'This coupon is not valid for your account' });
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    
    res.status(200).json({
      success: true,
      discount: discountAmount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUsagePerProduct: coupon.maxUsagePerProduct,
      },
    });
  } catch (error) {
        console.error('Coupon apply error:', error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
}

export default handler;
