import TrustBadge from '@/models/TrustBadge';
import db from '@/utils/db';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    const badges = await TrustBadge.find({ isActive: true }).sort({ order: 1 }).lean();
    
    res.status(200).json({
      success: true,
      badges,
    });
  } catch (error) {
    console.error('Error fetching trust badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trust badges',
      error: error.message,
    });
  }
};

export default handler;
