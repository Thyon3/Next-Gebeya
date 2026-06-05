import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import SocialProofStat from '@/models/SocialProofStat';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  try {
    await db.connect();
    const stats = await SocialProofStat.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();
        res.status(200).json(stats);
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

const postHandler = async (req, res) => {
  try {
    await db.connect();
    const newStat = new SocialProofStat({
      label: req.body.label,
      value: req.body.value,
      icon: req.body.icon || 'users',
      color: req.body.color || 'primary',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      order: req.body.order || 0,
    });
    const stat = await newStat.save();
        res.status(201).json(stat);
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

export default handler;
