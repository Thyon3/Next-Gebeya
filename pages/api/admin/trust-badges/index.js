import { isAuth, isAdmin } from '@/utils/auth';
import TrustBadge from '@/models/TrustBadge';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  
  if (!user || !user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  await db.connect();

  if (req.method === 'GET') {
    try {
      const badges = await TrustBadge.find({}).sort({ order: 1 });
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, icon, color, isActive, order } = req.body;

      const badge = await TrustBadge.create({
        title,
        description,
        icon,
        color,
        isActive,
        order,
      });

      res.status(201).json(badge);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

  };

export default handler;
