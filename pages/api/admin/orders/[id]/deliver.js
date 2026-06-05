import Order from "@/models/Order";
import db from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).send("Admin sign in required");
  }

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
