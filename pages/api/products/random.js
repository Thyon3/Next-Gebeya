import Product from "@/models/Product";
import db from "@/utils/db";

/**
 * GET /api/products/random?count=6&exclude=slug1,slug2
 * Returns `count` randomly selected products, optionally excluding certain slugs.
 */
const handler = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        await db.connect();

        const count = parseInt(req.query.count) || 6;
        const excludeSlugs = req.query.exclude
            ? req.query.exclude.split(",")
            : [];

        const matchStage = excludeSlugs.length > 0
            ? { slug: { $nin: excludeSlugs } }
            : {};

        // Use MongoDB $sample for true random selection
        const products = await Product.aggregate([
            { $match: matchStage },
            { $sample: { size: count } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    price: 1,
                    discountPercentage: 1,
                    flashSalePrice: 1,
                    isFlashSale: 1,
                    rating: 1,
                    numReviews: 1,
                    countInStock: 1,
                    brand: 1,
                    category: 1,
                },
            },
        ]);

        // Add a cache-control header to prevent caching so products are fresh on each load
        res.setHeader("Cache-Control", "no-store, max-age=0");
        return res.status(200).json({ products });
    } catch (error) {
        console.error("Error fetching random products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default handler;
