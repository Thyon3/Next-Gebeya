import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  
  if (!user || !user.isAdmin) {
    return res.status(401).send("Admin sign in required");
  }

  await db.connect();
  
  const orders = await Order.find({}).populate("user", "name").sort({ createdAt: -1 });
  
    
  res.send(orders);
};

export default handler;
