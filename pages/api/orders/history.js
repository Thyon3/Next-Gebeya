import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch (e) { return; }

  await db.connect();

  const orders = await Order.find({ user: user._id });


  res.send(orders);
};

export default handler;
