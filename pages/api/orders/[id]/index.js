import { isAuth, isAdmin } from '@/utils/auth';
import Order from "@/models/Order";
import Product from "@/models/Product";
import db from "@/utils/db";

const handler = async (req, res) => {
  let user; try { user = await isAuth(req, res); } catch(e) { return; }
  
  if (!user) {
    return res.status(401).send({ message: "Sign in required" });
  }

  await db.connect();
  
  const order = await Order.findById(req.query.id);
  
  if (!order) {
    return res.status(404).send({ message: "Order not found" });
  }
  
  // Enrich order items with product slugs if missing
  const enrichedOrderItems = await Promise.all(
    order.orderItems.map(async (item) => {
      if (!item.slug) {
        // Try to find the product by name to get the slug
        const product = await Product.findOne({ name: item.name }).select('slug');
        if (product) {
          return { ...item.toObject(), slug: product.slug };
        }
      }
      return item.toObject();
    })
  );
  
  // Return order with enriched items
  const enrichedOrder = {
    ...order.toObject(),
    orderItems: enrichedOrderItems,
  };
  
  res.send(enrichedOrder);
};

export default handler;
