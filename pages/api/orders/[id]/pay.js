import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user;
try { user = await isAuth(req, res); } catch(e) { return; }
  await db.connect();
  
  const order = await Order.findById(req.query.id);
  
  if (order) {
    if (order.isPaid) {
      return res.status(400).send({ message: "Order is already paid" });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address,
    };
    
    const paidOrder = await order.save();
    
    res.send({ message: "Order paid successfully", order: paidOrder });
  } else {
    res.status(404).send({ message: "Order not found" });
  }
};

export default handler;
