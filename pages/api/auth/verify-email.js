import User from "@/models/User";
import Coupon from "@/models/Coupon";
import db from "@/utils/db";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(422).json({
      message: "Email and verification code are required",
    });
  }

  // Clean the verification code (remove spaces, trim, etc.)
  const cleanCode = verificationCode.toString().replace(/\s/g, '').trim();

  if (!/^\d{6}$/.test(cleanCode)) {
    return res.status(422).json({
      message: "Verification code must be 6 digits",
    });
  }

  await db.connect();

  try {
    const user = await User.findOne({ email });

    if (!user) {
            return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
    }

    // Check if code has expired
    if (new Date() > user.verificationCodeExpiry) {
            return res.status(400).json({ 
        message: "Verification code has expired. Please request a new one.",
        expired: true,
      });
    }

    // Check if code matches (compare cleaned codes)
    if (user.verificationCode !== cleanCode) {
            return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    // Create welcome coupon now that email is verified
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 2);

    const welcomeCoupon = new Coupon({
      code: user.welcomeCouponCode,
      userId: user._id,
      discountType: 'percentage',
      discountValue: 20,
      expiryDate: expiryDate,
      isActive: true,
      isUsed: false,
      couponType: 'welcome',
      maxUsagePerProduct: 1,
    });

    await welcomeCoupon.save();

    
    res.status(200).json({
      message: "Email verified successfully!",
      welcomeCouponCode: user.welcomeCouponCode,
    });
  } catch (error) {
        console.error('Verification error:', error);
    res.status(500).json({ message: "Error verifying email. Please try again." });
  }
}

export default handler;
