import Product from "@/models/Product";
import db from "@/utils/db";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    await db.connect();

    // Search for products
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .select("name slug image price brand category")
      .limit(5)
      .lean();

    // Get matching categories
    const categories = await Product.distinct("category", {
      category: { $regex: q, $options: "i" },
    });

    // Get matching brands
    const brands = await Product.distinct("brand", {
      brand: { $regex: q, $options: "i" },
    });

    // Count products per category
    const categoryPromises = categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat });
      return { type: "category", name: cat, count };
    });

    // Count products per brand
    const brandPromises = brands.map(async (brand) => {
      const count = await Product.countDocuments({ brand });
      return { type: "brand", name: brand, count };
    });

    const [categoryCounts, brandCounts] = await Promise.all([
      Promise.all(categoryPromises),
      Promise.all(brandPromises),
    ]);

    
    // Combine results
    const suggestions = [
      ...products.map((p) => ({
        ...p,
        type: "product",
      })),
      ...categoryCounts.slice(0, 3),
      ...brandCounts.slice(0, 3),
    ];

    res.json(suggestions);
  } catch (error) {
    console.error("Search suggestions error:", error);
        res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;
