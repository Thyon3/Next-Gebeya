import Product from "@/models/Product";
import db from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).send("Admin sign in required");
  }

  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "POST") {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const products = await Product.find({});
    res.send(products);
};

const postHandler = async (req, res) => {
  await db.connect();
  
  const newProduct = new Product({
    name: req.body.name || "Sample Product",
    slug: req.body.slug || "sample-product-" + Math.random(),
    image: req.body.image || "/images/sample.jpg",
    images: Array.isArray(req.body.images) 
      ? req.body.images.filter(img => img && img.trim() !== '') 
      : [],
    price: req.body.price || 0,
    category: req.body.category || "Sample Category",
    brand: req.body.brand || "Sample Brand",
    brandLogo: req.body.brandLogo || "",
    countInStock: req.body.countInStock || 0,
    description: req.body.description || "Sample description",
    rating: 0,
    ratings: [],
    totalRatings: 0,
    numReviews: 0,
    reviews: [],
    isFeatured: req.body.isFeatured || false,
    banner: req.body.banner || "",
    isNewArrival: req.body.isNewArrival || false,
    isFlashSale: req.body.isFlashSale || false,
    flashSalePrice: req.body.flashSalePrice || null,
    flashSaleEndDate: req.body.flashSaleEndDate || null,
    discountPercentage: req.body.discountPercentage || 0,
  });

  const product = await newProduct.save();
    
  res.send({
    message: "Product created successfully",
    product,
  });
};

export default handler;
