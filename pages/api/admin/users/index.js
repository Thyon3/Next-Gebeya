import { isAuth, isAdmin } from '@/utils/auth';
import User from "@/models/User";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  
  if (!user || !user.isAdmin) {
    return res.status(401).send("Admin sign in required");
  }

  await db.connect();
  const users = await User.find({});
    
  res.send(users);
};

export default handler;
