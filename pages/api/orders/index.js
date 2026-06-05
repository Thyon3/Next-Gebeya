import Order from "@/models/Order";
import Product from "@/models/Product";
import db from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { emitStockUpdate, emitProductSoldOut, emitLowStockAlert } from "@/utils/socket";

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).send("Sign in required");
  }

  const { user } = session;
  
  await db.connect();
  
  try {
    const newOrder = new Order({
      ...req.body,
      user: user._id,
    });

    const order = await newOrder.save();
    
    // Update stock for each product and emit real-time updates
    for (const item of req.body.orderItems) {
      const product = await Product.findById(item._id);
      
      if (product) {
        const oldStock = product.countInStock;
        const newStock = Math.max(0, oldStock - item.quantity);
        
        product.countInStock = newStock;
        await product.save();
        
        // Emit stock update event
        emitStockUpdate(product._id.toString(), {
          slug: product.slug,
          name: product.name,
          oldStock,
          newStock,
        });
        
        // Emit sold out event if stock reaches 0
        if (newStock === 0 && oldStock > 0) {
          emitProductSoldOut(product._id.toString(), {
            slug: product.slug,
            name: product.name,
          });
        }
        
        // Emit low stock alert if stock is low (5 or less)
        if (newStock > 0 && newStock <= 5 && oldStock > 5) {
          emitLowStockAlert(product._id.toString(), {
            slug: product.slug,
            name: product.name,
            stock: newStock,
          });
        }
      }
    }
    
        res.status(201).send(order);
  } catch (error) {
        console.error('Order creation error:', error);
    res.status(500).send({ message: error.message });
  }
};

export default handler;
