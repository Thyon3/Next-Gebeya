import { isAuth, isAdmin } from '@/utils/auth';
import bcryptjs from "bcryptjs";
import User from "@/models/User";
import db from "@/utils/db";

async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  if (!user) {
    return res.status(401).json({ message: "Sign in required" });
  }

  const { user } = user;
  const { name, email, password, profileImage } = req.body;

  // Validation
  if (
    !name ||
    !email ||
    !email.includes("@") ||
    (password && password.trim().length < 6)
  ) {
    return res.status(422).json({
      message: "Validation error. Please check your input.",
    });
  }

  await db.connect();

  const toUpdateUser = await User.findById(user._id);
  if (!toUpdateUser) {
        return res.status(404).json({ message: "User not found" });
  }

  toUpdateUser.name = name;
  toUpdateUser.email = email;

  if (password) {
    toUpdateUser.password = bcryptjs.hashSync(password, 12);
  }

  if (profileImage !== undefined) {
    toUpdateUser.profileImage = profileImage;
  }

  await toUpdateUser.save();
  
  res.status(200).json({
    message: "User updated successfully",
  });
}

export default handler;
