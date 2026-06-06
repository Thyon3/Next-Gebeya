import Product from "@/models/Product";
import db from "@/utils/db";

const handler = async (req, res) => {
  await db.connect();

  if (req.method === "GET") {
    const product = await Product.findById(req.query.id).lean();
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Calculate sold count dynamically
    const { calculateSoldCount } = await import('@/utils/soldCount');
    const soldCount = await calculateSoldCount(req.query.id);
    
    res.status(200).json({
      ...product,
      soldCount
    });
  } else if (req.method === "PUT") {
    // Update product rating
    const product = await Product.findById(req.query.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { rating } = req.body;

    if (rating) {
      // Add new rating to ratings array
      product.ratings.push(rating);
      product.totalRatings = product.ratings.length;
      
      // Calculate average rating
      const sum = product.ratings.reduce((acc, curr) => acc + curr, 0);
      product.rating = sum / product.totalRatings;
      
      await product.save();
    }

    res.status(200).json({ message: "Product updated successfully" });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
