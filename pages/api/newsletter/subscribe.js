import Newsletter from "@/models/Newsletter";
import Coupon from "@/models/Coupon";
import SiteSettings from "@/models/SiteSettings";
import db from "@/utils/db";
import { sendNewsletterWelcomeEmail } from "@/utils/email";
import crypto from "crypto";

// Generate newsletter discount code
function generateNewsletterCode() {
  const prefix = 'NEWS';
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomStr}`;
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  // Validation
  if (!email || !email.includes("@")) {
    return res.status(422).json({
      message: "Please provide a valid email address",
    });
  }

  await db.connect();

  try {
    // Check if email already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
            
      if (existingSubscriber.isActive) {
        return res.status(400).json({ 
          message: "This email is already subscribed to our newsletter",
          alreadySubscribed: true,
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        
        return res.status(200).json({
          message: "Welcome back! Your subscription has been reactivated.",
          discountCode: existingSubscriber.discountCode,
        });
      }
    }

    // Get site settings for discount percentage
    const settings = await SiteSettings.findOne();
    const discountPercentage = settings?.newsletterDiscountPercentage || 10;

    // Generate unique discount code
    let discountCode;
    let isUnique = false;
    
    while (!isUnique) {
      discountCode = generateNewsletterCode();
      const existingCoupon = await Coupon.findOne({ code: discountCode });
      if (!existingCoupon) {
        isUnique = true;
      }
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create newsletter subscription
    const newsletter = new Newsletter({
      email: email.toLowerCase(),
      discountCode,
      isActive: true,
      unsubscribeToken,
    });

    await newsletter.save();

    // Create discount coupon (expires in 30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const coupon = new Coupon({
      code: discountCode,
      discountType: 'percentage',
      discountValue: discountPercentage,
      expiryDate: expiryDate,
      isActive: true,
      isUsed: false,
      couponType: 'newsletter',
      maxUsagePerProduct: 1,
    });

    await coupon.save();

    // Send welcome email with discount code
    let emailSent = false;
    try {
      await sendNewsletterWelcomeEmail({
        email: newsletter.email,
        discountCode,
        discountPercentage,
        unsubscribeToken,
      });
      emailSent = true;
      console.log('✅ Newsletter email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Failed to send newsletter welcome email:', emailError);
      // Continue even if email fails - user still gets the code
    }

    
    res.status(201).json({
      message: "Successfully subscribed to newsletter!",
      discountCode,
      discountPercentage,
      emailSent,
    });
  } catch (error) {
        console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: "Error subscribing to newsletter. Please try again." });
  }
}

export default handler;
