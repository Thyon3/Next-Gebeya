import User from "@/models/User";
import Coupon from "@/models/Coupon";
import db from "@/utils/db";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/utils/email";

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate unique welcome coupon code
function generateWelcomeCouponCode() {
  const prefix = 'WELCOME';
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomStr}`;
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  // Validation
  if (
    !name ||
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 6
  ) {
    return res.status(422).json({
      message: "Validation error. Please check your input.",
    });
  }

  await db.connect();

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
            return res.status(422).json({ message: "User already exists!" });
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 12);

    // Generate verification code (expires in 10 minutes)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Generate unique welcome coupon code
    let couponCode;
    let isUnique = false;
    
    while (!isUnique) {
      couponCode = generateWelcomeCouponCode();
      const existingCoupon = await Coupon.findOne({ code: couponCode });
      if (!existingCoupon) {
        isUnique = true;
      }
    }

    // Create new user (not verified yet)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpiry,
      welcomeCouponCode: couponCode,
      welcomeCouponUsed: false,
    });

    const user = await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationCode,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    
    res.status(201).json({
      message: "User created successfully! Please check your email for verification code.",
      userId: user._id.toString(),
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
        console.error('Signup error:', error);
    res.status(500).json({ message: "Error creating user. Please try again." });
  }
}

export default handler;
