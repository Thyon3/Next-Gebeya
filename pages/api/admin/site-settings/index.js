import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import SiteSettings from '@/models/SiteSettings';
import db from '@/utils/db';

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin sign in required');
  }

  await db.connect();

  if (req.method === 'GET') {
    try {
      let settings = await SiteSettings.findOne();
      
      // Create default settings if none exist
      if (!settings) {
        settings = await SiteSettings.create({});
      }
      
      // Convert to plain object
      const settingsObj = settings.toObject();
      
      // Replace empty strings with model defaults
      if (!settingsObj.testimonialsHeading || settingsObj.testimonialsHeading.trim() === '') {
        settingsObj.testimonialsHeading = 'What Our Customers Say';
      }
      if (!settingsObj.testimonialsDescription || settingsObj.testimonialsDescription.trim() === '') {
        settingsObj.testimonialsDescription = 'Join thousands of satisfied customers who trust us for quality products and excellent service';
      }
      
      res.status(200).json(settingsObj);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      console.log('=== PUT Request Body ===');
      console.log('testimonialsHeading:', req.body.testimonialsHeading);
      console.log('testimonialsDescription:', req.body.testimonialsDescription);
      
      let settings = await SiteSettings.findOne();
      
      if (!settings) {
        console.log('No settings found, creating new...');
        settings = await SiteSettings.create(req.body);
      } else {
        console.log('Updating existing settings...');
        // Update existing settings with all provided values
        Object.keys(req.body).forEach(key => {
          console.log(`Setting ${key} = ${req.body[key]}`);
          settings[key] = req.body[key];
        });
        await settings.save();
      }
      
      console.log('=== Saved Settings ===');
      console.log('testimonialsHeading:', settings.testimonialsHeading);
      console.log('testimonialsDescription:', settings.testimonialsDescription);
      
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }

  };

export default handler;
