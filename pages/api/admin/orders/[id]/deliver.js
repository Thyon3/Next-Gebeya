import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
if (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }
  await db.connect();
  
  const order = await Order.findById(req.query.id);
  
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const deliveredOrder = await order.save();
    res.send({
      message: "Order delivered successfully",
      order: deliveredOrder,
    });
  } else {
    res.status(404).send({ message: "Order not found" });
  }
};

export default handler;
