import Order from "@/models/Order";
import db from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).send("Admin sign in required");
  }

  await db.connect();
  
  const orders = await Order.find({}).populate("user", "name").sort({ createdAt: -1 });
  
    
  res.send(orders);
};

export default handler;
