import { isAuth, isAdmin } from '@/utils/auth';
import SiteSettings from '@/models/SiteSettings';
import db from '@/utils/db';

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  
  if (!user || !user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    
    // Delete existing settings
    await SiteSettings.deleteMany({});
    
    // Create new settings with defaults
    const settings = await SiteSettings.create({});
    
        
    res.status(200).json({ 
      success: true, 
      message: 'Settings reset to defaults successfully',
      settings 
    });
  } catch (error) {
        res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export default handler;
