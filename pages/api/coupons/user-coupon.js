import Coupon from '@/models/Coupon';
import User from '@/models/User';
import db from '@/utils/db';
import { isAuth } from '@/utils/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let userAuth;
  try {
    userAuth = await isAuth(req, res);
  } catch (err) {
    return; // isAuth already sent response
  }

  await db.connect();

  try {
    const user = await User.findById(userAuth._id);

    console.log('User found:', !!user);
    if (user) {
      console.log('User welcomeCouponCode:', user.welcomeCouponCode);
      console.log('User welcomeCouponUsed:', user.welcomeCouponUsed);
    }

    if (!user || !user.welcomeCouponCode) {
      console.log('No user or no welcome coupon code');
      return res.status(200).json({ hasCoupon: false });
    }

    // Check if already used
    if (user.welcomeCouponUsed) {
      console.log('Welcome coupon already used');
      return res.status(200).json({ hasCoupon: false });
    }

    // Get coupon details
    const coupon = await Coupon.findOne({
      code: user.welcomeCouponCode,
      userId: user._id,
    });

    console.log('Coupon found:', !!coupon);
    if (coupon) {
      console.log('Coupon code:', coupon.code);
      console.log('Coupon isValid:', coupon.isValid());
      console.log('Coupon expiry:', coupon.expiryDate);
      console.log('Coupon isUsed:', coupon.isUsed);
      console.log('Coupon isActive:', coupon.isActive);
    }

    if (!coupon) {
      console.log('Coupon not found in database');
      return res.status(200).json({ hasCoupon: false });
    }

    // Check if valid
    if (!coupon.isValid()) {
      console.log('Coupon is not valid');
      return res.status(200).json({ hasCoupon: false });
    }


    console.log('Returning valid coupon');
    res.status(200).json({
      hasCoupon: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiryDate: coupon.expiryDate,
        couponType: coupon.couponType,
      },
    });
  } catch (error) {
    console.error('Get user coupon error:', error);
    res.status(500).json({ message: 'Error fetching coupon' });
  }
}

export default handler;
