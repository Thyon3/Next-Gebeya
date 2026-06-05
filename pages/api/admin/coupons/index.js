import { getSession } from 'next-auth/react';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ message: 'Admin access required' });
  }

  if (req.method === 'GET') {
    await db.connect();
    try {
      const coupons = await Coupon.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

            res.status(200).json(coupons);
    } catch (error) {
            res.status(500).json({ message: 'Error fetching coupons' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
