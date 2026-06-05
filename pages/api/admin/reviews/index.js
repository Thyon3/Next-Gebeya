import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import db from "@/utils/db";
import Review from "@/models/Review";

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ message: "Admin access required" });
  }

  if (req.method === "GET") {
    return getReviews(req, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
};

const getReviews = async (req, res) => {
  try {
    await db.connect();

    const reviews = await Review.find({})
      .populate("product", "name image")
      .sort({ createdAt: -1 })
      .lean();

    
    res.status(200).json(reviews.map(db.convertDocToObj));
  } catch (error) {
        res.status(500).json({ message: error.message });
  }
};

export default handler;
