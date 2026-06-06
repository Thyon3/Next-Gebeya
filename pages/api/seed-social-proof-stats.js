import { isAuth, isAdmin } from '@/utils/auth';
import SocialProofStat from '@/models/SocialProofStat';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch (e) { return; }
  if (!user.isAdmin) {
    return res.status(401).send({ message: 'Admin sign in required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();

    // Check if stats already exist
    const existingCount = await SocialProofStat.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        message: 'Stats already exist. Delete them first if you want to reseed.'
      });
    }

    const defaultStats = [
      {
        label: 'Happy Customers',
        value: '10K+',
        icon: 'users',
        color: 'primary',
        isActive: true,
        order: 1,
      },
      {
        label: 'Satisfaction Rate',
        value: '98%',
        icon: 'heart',
        color: 'success',
        isActive: true,
        order: 2,
      },
      {
        label: '5-Star Reviews',
        value: '5K+',
        icon: 'star',
        color: 'secondary',
        isActive: true,
        order: 3,
      },
      {
        label: 'Customer Support',
        value: '24/7',
        icon: 'support',
        color: 'info',
        isActive: true,
        order: 4,
      },
    ];

    await SocialProofStat.insertMany(defaultStats);

    res.status(201).json({
      message: 'Social proof stats seeded successfully',
      count: defaultStats.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
