import { isAuth, isAdmin } from '@/utils/auth';
import TrustBadge from '@/models/TrustBadge';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  const { id } = req.query;

  await db.connect();

  if (req.method === 'GET') {
    try {
      const badge = await TrustBadge.findById(id);
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }
      res.status(200).json(badge);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const badge = await TrustBadge.findById(id);
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }

      const { title, description, icon, color, isActive, order } = req.body;

      badge.title = title || badge.title;
      badge.description = description || badge.description;
      badge.icon = icon || badge.icon;
      badge.color = color || badge.color;
      badge.isActive = isActive !== undefined ? isActive : badge.isActive;
      badge.order = order !== undefined ? order : badge.order;

      await badge.save();
      res.status(200).json(badge);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const badge = await TrustBadge.findById(id);
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }

      await badge.deleteOne();
      res.status(200).json({ message: 'Badge deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
