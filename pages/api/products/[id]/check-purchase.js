import { isAuth, isAdmin } from '@/utils/auth';
import db from "@/utils/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let user; try { user = await isAuth(req, res); } catch(e) { return; }

  if (!user) {
    return res.status(401).json({ message: "Sign in required" });
  }

  try {
    await db.connect();

    const { id } = req.query;

    // Get product to find its slug
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has purchased and received this product
    // Check by slug (new orders) OR by name (old orders)
    const hasPurchased = await Order.findOne({
      user: user._id,
      $or: [
        { "orderItems.slug": product.slug },
        { "orderItems.name": product.name }
      ],
      isPaid: true,
      isDelivered: true, // Only allow reviews for delivered orders
    });

    res.status(200).json({
      hasPurchased: !!hasPurchased,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
