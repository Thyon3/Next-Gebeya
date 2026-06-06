import User from "@/models/User";
import db from "@/utils/db";
import { sendVerificationEmail } from "@/utils/email";

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function handler(req, res) {
  return res.status(200).json({ message: "Email verification is currently disabled. All accounts are automatically verified." });
}

export default handler;
