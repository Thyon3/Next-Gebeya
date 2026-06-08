import { isAuth, isAdmin } from '@/utils/auth';
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const handler = async (req, res) => {
  try {
    let user; try { user = await isAuth(req, res); } catch(e) { return; }
    
    console.log('=== CLOUDINARY SIGN REQUEST ===');
    console.log('user exists:', !!user);
    console.log('user data:', JSON.stringify(user, null, 2));
    
    if (!user) {
      console.log('❌ No user found');
      return res.status(401).json({ 
        error: "Authentication required - please login",
        hasSession: false 
      });
    }
    
    console.log('User email:', user?.email);
    console.log('User isAdmin:', user?.isAdmin);
    console.log('User isAdmin type:', typeof user?.isAdmin);
    
    if (!user?.isAdmin) {
      console.log('❌ User is not admin');
      return res.status(401).json({ 
        error: "Admin access required",
        hasSession: true,
        isAdmin: user?.isAdmin,
        userEmail: user?.email
      });
    }

    console.log('✓ Admin access granted');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.v2.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_SECRET
    );

    res.status(200).json({ 
      signature, 
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('=== CLOUDINARY SIGN ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
